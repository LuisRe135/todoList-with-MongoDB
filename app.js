//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb+srv://admin-luisre:Test123@cluster0.idp4p.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const firstTask = new Item({
  name: "Study harder"
});
const secondTask = new Item({
  name: "Study smarter"
});
const thirdTask = new Item({
  name: "Study better"
});

const defaultItems = [firstTask, secondTask, thirdTask];





app.get("/", function(req, res) {

  Item.find((err, docs)=>{
    if(err){
      console.log(err);
    }else{
    if(docs.length === 0){
      Item.insertMany(defaultItems, (err)=> {
        if(err){
          console.log(err);
        }
        else{
          console.log("Documents inserted");
        }
      });
      res.redirect("/");
    }
    else{

      res.render("list", {listTitle: "Today", newListItems: docs});
    }
  }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newTask = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newTask.save();
    res.redirect("/")
  }
  else {
    List.findOne({name: listName}, (err, foundList) => {
      if(err){
        console.log(err);
      } else{

        foundList.items.push(newTask);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }

});

app.post("/delete", (req, res)=> {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItem, (err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log("success");
        res.redirect("/")
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItem}}}, (err, foundList)=>{
      if(!err){

        res.redirect("/"+listName);
      }
      else{
        console.log(err);
      }
    });
  }

});

app.get("/:listName", (req, res)=>{
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, (err, foundList)=>{
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        const list = new List({
          name: listName,
          items: []
        });
        list.save();
        res.redirect("/"+listName);
      } else {
        res.render("list", {listTitle: listName, newListItems: foundList.items});
      }

    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port "+ port);
});
