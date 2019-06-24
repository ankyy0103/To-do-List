//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ankit:Test123@cluster0-duhok.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=new mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<-- Hit this tho delete the task."
});

const defaultItems=[item1,item2,item3];
// Item.insertMany(defaultItems,function (err) {
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Succesfully added default items");
//   }
// });

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const List=new mongoose.model("List",listSchema);

app.get("/", function(req, res) {
   Item.find({},function (err,items) {
     if(items.length==0){
      Item.insertMany(defaultItems,function (err) {
        if(err){
          console.log(err);
        }else{
          console.log("Succesfully added default items");
        }
      });
     }
    res.render("list", {listTitle: "Today", newListItems: items});
   });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const  nameOfList=req.body.list;
  const newItem=new Item({
    name:itemName
  })
  if(nameOfList=="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:nameOfList},function(err,foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+nameOfList);
    })
  }
 

});

app.post("/delete",function(req,res) {
   const checkItemId=req.body.checkBox;
   const nameOfList=req.body.listname;
   if(nameOfList=="Today"){
     Item.findByIdAndRemove(checkItemId,function(err){
       if(!err){
         console.log("Succesfully deleted checked Item");
       }
     })
   }else{
     List.findOneAndUpdate({name:nameOfList}, {$pull:{items:{_id:checkItemId}}}, function (err,foundList) {
       if(!err){
         res.redirect("/"+nameOfList);
       }
     }) 
   }
})

app.get("/:listName",function(req,res){
  const bodyParameter=_.capitalize(req.params.listName);
  List.findOne({name:bodyParameter},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list=new List({
          name:bodyParameter,
          items:defaultItems
        });
        list.save();
        res.redirect("/" +bodyParameter );
      }else{
       //Show existing list
       res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
   
  })

})


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has Started Succesfully");
});
