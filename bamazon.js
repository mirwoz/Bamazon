var mysql = require("mysql");
var inquirer = require('inquirer');


var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "null",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    afterConnection();
});

//pushing all items into an array 
function afterConnection(_cb = null) {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var productArray = [];
        res.forEach(item => {
            productArray.push(item.product);

        });
        selectProduct(productArray)

    })
}


//uses inquirer to ask user which item they would like to buy, then how much of each item
function selectProduct(choices) {

    inquirer
        .prompt([{
            type: "rawlist",
            name: "products",
            message: "Which item would you like to buy?",
            choices: choices
        },

        {
            type: "input",
            name: "quantity",
            message: `How many would you like?`,
            validate: function (value) {
                var valid = !isNaN(parseFloat(value));
                return valid || "Please enter a number"
            },
            filter: Number
        }


        ]).then(answers => {
            let chosenProduct = answers.products;
            let chosenQuantity = answers.quantity;
            confirmQuantity(chosenProduct, chosenQuantity);
        })


};

//this function asks the user to confirm the quantity of product ordered. If confirmed, check to see if it's in stock. If not, go back to beginning.
function confirmQuantity(product, quantity) {
    inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to buy ${quantity} ${product}s?`,
        default: true
    }]).then(answers => {
        if (confirm = true) {
            validateQuantity(product, quantity);
        } else {
            selectProduct();
        };
    })
};


//checking to see if product is in stock. If it is, place order. If not, go back to beginning.
function validateQuantity(product, quantity) {
    connection.query(`SELECT * FROM products WHERE product = '${product}'`, function (err, res) {

        if (err) {
            throw err;
        }
        else if (res[0].stock_quantity === 0 || res[0].stock_quantity < quantity) {
            console.log(`We're sorry, there is only ${res[0].stock_quantity} left. Please adjust your order`)
            afterConnection();
        }
        else {
            connection.query(`UPDATE products SET stock_quantity = '${res[0].stock_quantity - quantity}' WHERE item_id = '${res[0].item_id}'`);
            console.log(`Great! Your order has been placed. Your total is ${res[0].price * quantity}`);
            confirmRestart();
        }

    });
};

//prompts user to buy another item or quit
function confirmRestart() {
    inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        message: `Would you like to buy another item? `,
        default: true
    }]).then(answer => {
        if (answer.confirm === true) {
            console.log("Great!");
            afterConnection();
        } else {
            console.log("Goodbye!");
        };
    });
};
