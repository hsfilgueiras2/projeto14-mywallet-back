import joi from "joi";
import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from 'bcrypt';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
const app = express();
app.use(express.json());
app.use(cors());

try {
    console.log('conectando...');await mongoClient.connect();console.log("conectado")
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("projeto_MyWallet");
const accounts = db.collection("accounts")

//Functions

//Paths

app.post("/signUp",async(req,res)=>{
    const {name,email,password} = req.body;
    const cryptPassword = bcrypt.hashSync(password, 10);
    try {
        if (await accounts.findOne({ name: name })) {
            res.sendStatus(409)
            return
        }
        await accounts.insertOne(
            { name: name, email:email,password:cryptPassword }
        );
        res.sendStatus(201);

    } catch (err) { res.sendStatus(500) }
})

app.post("/login",async(req,res)=>{
    const {email, password} = req.body;
    try{
        const user = await accounts.findOne({ email:email })

        console.log("PESQUISA FEITA")
        if(user && bcrypt.compareSync(password, user.password)) {
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    }catch(err){res.sendStatus(500)}
})

app.listen(process.env.PORT, () => console.log(`server running on port ${process.env.PORT}`));