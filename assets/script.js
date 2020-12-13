// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        // object for each expense item
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        // A prototype method for Expense object to store percentage of each expense items.
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        // A prototype method for Expense object to return percentage of each expense items
        return this.percentage;
    }


    var Income = function(id, description, value) {
        // object for each income item
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // object containing all the data items
    var data = {
        // allItems contain all items as an oject
        allItems: {
            exp: [],
            inc: []
        },
        // totals is total expenses and total income
        totals: {
            exp: 0,
            inc: 0
        },
        // global variable for budget
        budget: 0,
        // overall percentage of expenses
        percentage: -1
    };

    // calculate total income and expenses
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    return {
        // add items in data object
        addItem: function(type, des, val) {
            var newItem;
            
            // Create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem)
            
            return newItem;
        },


        // delete items from data object
        deleteItem: function(type, id) {
            // Since the IDs may or may not be in order, we can't use indexing to remove that element
            // therefore, we need to loop over and match the IDs

            // map is similar to forEach except that it always returns a array;
            var ids = data.allItems[type].map(function(current) { 
                return current.id;
            });
            // now, ids contains all the value of ids of each data type.

            // Now find the index of id from ids
            index = ids.indexOf(id);

            if (index !== -1) { 
                // to delete from the required index, and 1 item.
                data.allItems[type].splice(index, 1);
            };

        },

        // calculate overall budget and overall percentage of expenses 
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // caclculate the percentage of income that we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

            
        },

        // calculates percentage of each expense items
        caculatePercentages: function() {
            // this function calculates percentage on each expense items
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        // returns percentage of each expense items
        getPercentages: function() {    
            // this function returns an array containing percentages of each items.
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });

            return allPercentages;
        },

        // returns budget items from data object
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        // function used to test for datas in data object
        testing: function() {
            console.log(data.allItems);
        }
    };

}) ();

// UI CONTROLLER
var UIController = (function() {
    
    // to avoid using class names again and again.
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    // formats the number according to some rules
    var formatNumber = function(num, type) {
            // function does:
            // + or - before number
            // exactly 2 decimal points
            // comma seperating the thousands

            num = Math.abs(num);
            // to get 2 decimal places
            num = num.toFixed(2);

            var numSplit = num.split('.');
            intPart = numSplit[0];
            decPart = numSplit[1];

            if (intPart.length > 3) {
                intPart = intPart.substr(0, intPart.length-3) + ',' + intPart.substr(intPart.length-3, 3);
            }

            // ternary operator
            var sign;
            type === 'exp' ? sign = '-' : sign = '+';

            return sign + ' ' + intPart + '.' + decPart;
        };

    // for each of the nodes in list it calls the callback_func (useful when we want to call function on each list item)
    var nodeListForEach = function(list, callback_func) {
        for(var i=0; i<list.length; i++) {
            callback_func(list[i], i);
        }
    };

    return {
        // to get input when user enters in respective feilds
        getInput: function() {
            return {
                // + or -
                type : document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                // description of expense or increment
                description : document.querySelector(DOMstrings.inputDescription).value,
                // value of expense or increment
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        // add item in respective lists in the user interface
        addListItem: function(obj, type) {
            // 1. create HTML string with placeholder text
            var html, newhtml, element;

            if (type === 'inc'){
                element = DOMstrings.incomeContainer;

                // Notice the % -- % in between of the strings, these denotes the value that we'll replace from this string
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%31%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // 2. replace the placeholder text with some actual data
            // We'll replace the place holder value with input data
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description); 
            newhtml = newhtml.replace('%value%', formatNumber(obj.value, type)); 
            // newhtml = newhtml.replace

            // 3. Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);

        },

        // deletes list items
        deleteListItem: function(selectorId) {
            // we can delete an HTML element using two methods
            // either we can move to parent node of the child which we want to delete and use removeChild() method
            // or we can use remove() directly on the child element.
    
            var el = document.getElementById(selectorId);
            
            // remove() method
            el.remove();

            // removeChild() method

            // el.parentNode.removeChild(el);

        },

        // clears the input feilds after ENTER is pressed or button is clicked to insert the item
        clearFields: function() {

            // returns list(not array) of all elements with specified CSS.
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // convert list to array, to use array functions:
            fieldsArr = Array.prototype.slice.call(fields);
            
            // method to loop array.
            fieldsArr.forEach(function(current, index, array) {
                // console.log(current);
                // console.log(index);
                // console.log(array);
                current.value = "";
            });

            // making focus on description box after clearing. 
            fieldsArr[0].focus();
            
        },

        // to update the budget in UI.
        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);

            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');

            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        // display percentage corresponding to each item in the user interface
        displayPercentages: function(percentages) {
            // fields contain all element with tag of 'item__percentage'
            var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

            // Now we need to change the text content of percentage for each item of expense list

            // it calls the function named as nodeListForEach, passing fields and a callback_function as the arguments.
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },  

        displayMonth: function() {
            // method to display month and year.
            var now = new Date();

            var year = now.getFullYear();
            var month = now.getMonth();

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            document.querySelector(DOMstrings.dateLabel).textContent = months[month-1] + ', ' + year;
        },

        // change the color of the input fields when the type of input is income or expenses
        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        // make the function public so that it can be used from everywhere.
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
}) ();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    // seperate function to update budget (data + UI)
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budget = budgetCtrl.getBudget();

        // 3. Display budget in UI
        UICtrl.displayBudget(budget);
    };

    // function to update percentage (data + UI)
    var updatePercentages = function() {

        // 1. calculate percentages
        budgetCtrl.caculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    // Adds items from user input (data + UI)
    var ctrlAddItem = function() {
        // 1. Get the filled input data
        var input = UICtrl.getInput();
        
        // avoids using empty description and value block.
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to UI
            UICtrl.addListItem(newItem, input.type);
            
            // 4. clear fields
            UICtrl.clearFields();
            
            // 5. Calculate the budget and update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();
    
        };
    };


    var ctrlDeleteItem = function(event) {
        // console.log(event.target);

        // in order to delete the button node, we can use event delegation property and delete on the parent node using the ID of that list element.

        // eg. if we want to delete item with ID 2 from income list, then we'll delete from parent of that element with ID = 2

        // parent is 4 level up from the button in HTML code
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            var splitID = itemID.split('-');
            var type = splitID[0];
            var id = parseInt(splitID[1]); 

            // 1. delete the item from data structure
            budgetCtrl.deleteItem(type, id);

            // 2. delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();
        }

    };


    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        // perform event, both when clicked or pressed enter.

        // to handle click
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        // to handle ENTER
        // since key press occurs globally, i.e independent of position of mouse.
        // we don't have to use query selector.
        document.addEventListener('keypress', function(event) {
            // this event will get triggered, when we press any key,i.e it is not ENTER specific 
            // "event" keywords contains the info about which key is being pressed.
        
            // every key has a specific keycode, which is contained in "event"
            // keycode for ENTER is 13
            // console.log(event);
            if (event.keyCode === 13 || event.code === "Enter" || event.which === 13) {
                // console.log('ENTER IS PRESSED') 
                ctrlAddItem();
            }
        });


        // to delete item from list
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // change the color of the input feilds when inputing exp or inc
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };



    return {
        init: function() {
            console.log('Application has started');
            
            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    }

}) (budgetController, UIController);


// App runner
controller.init();