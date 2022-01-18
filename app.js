//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-avnish:admin123@cluster0.y4ubp.mongodb.net/todolistDB");

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"Avnish"
});

const item2 = new Item({
  name:"Kumar"
});

const item3 = new Item({
  name:"Singh"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function (err, fouundItem) {
    if (fouundItem.length === 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully Added to DB");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems:fouundItem});
    }
  });
  
});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err,foundList) {
    if (!err) {
      if (!foundList) {
         const list = new List({
        name: customListName,
        items:defaultItem
         });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list",{listTitle:foundList.name, newListItems:foundList.items})
      }
     }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  
  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  

});

app.post("/delete", function (req, res) {
  const checkItemID = req.body.checkbox;
  const listNameID = req.body.listName;
  if (listNameID === "Today") {
    Item.findByIdAndRemove(checkItemID, function (err) {
    if (!err) {
      console.log("Sucessful Deletion!");
    }
      res.redirect("/");
  }); 
  }
  else {
    List.findOneAndUpdate({ name: listNameID}, { $pull: { items: {_id:checkItemID } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listNameID);
      }
    });
  }
  
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
