'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.get('/digimon',getDigimonHandler);
app.post('/favDigimon',addToFavHandler);
app.get('/getFav',getFavHandler);
app.delete('/deleteDigi/:id',deleteDigiHandler);
app.put('/updateDigi/:id',updateDataHandler);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/digimon', {useNewUrlParser: true, useUnifiedTopology: true});

const digimonSchema = new mongoose.Schema({
    img:String,
    name: String,
    level:String
});

const digimonModel = mongoose.model('digimon', digimonSchema);

class Digimon{
    constructor(data){
        this.img=data.img;
        this.name=data.name;
        this.level=data.level;

    }
}

function getDigimonHandler(req,res){
    const url = (`https://digimon-api.vercel.app/api/digimon`);
    axios.get(url).then(result=>{
        const digimonData = result.data.map(ele=>{
            return new Digimon(ele);
        })
        res.send(digimonData);
    })
}

function addToFavHandler(req,res){
    const {img,name,level}=req.body;
    const newModel = new digimonModel({
        img:img,
        name:name,
        level:level,
    })
    newModel.save();
}

function getFavHandler(req,res){
    digimonModel.find({},(error,data)=>{
        res.send(data);
    })
}

function deleteDigiHandler(req,res){
    const id = req.params.id;
    digimonModel.remove({_id:id},(error,data)=>{
        digimonModel.find({},(error,data2)=>{
            res.send(data2)
        })
    })
}

function updateDataHandler(req,res){
    const id = req.params.id;
    const{img,name,level}=req.body;
    digimonModel.findOne({_id:id},(error,data)=>{
        data.img=img;
        data.name=name;
        data.level=level;
        data.save().then(()=>{
            digimonModel.find({},(error,data2)=>{
                res.send(data2)
            })
        })
    })
}

app.listen(PORT,(req,res)=>{
    console.log(`listenning to PORT ${PORT}`);
})