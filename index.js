const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wtex8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
    try{
        await client.connect();

        const database = client.db('ema-john');
        const productCollection = database.collection('products')
        const orderCollection = database.collection('orders');
        
        app.get('/products', async (req, res)=>{
            const cursor = productCollection.find({});
            const cnt = await cursor.count();
           
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const result = await cursor.skip(page*size).limit(size).toArray();
            
            res.send({cnt,result});
        })

        app.post('/products/byKeys', async(req, res) =>{
            const keys = req.body;
            const query = {key: {$in: keys}};
            const products = await productCollection.find(query).toArray();
            res.send(products)
        })

        app.post('/orders', async (req,res) =>{
            const result = await orderCollection.insertOne(req.body);
            console.log(result)
            res.json(result);
        })
    }
    finally{
    //    await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res)=>{
    console.log('ok')
})

app.listen(port, ()=>{
    console.log('port listening at ', port);
})