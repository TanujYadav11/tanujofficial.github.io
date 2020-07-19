//Budget Controller
var budgetController=(function(){
    
   var Expense = function(id, description, value) {
       this.id= id;
       this.description = description;
       this.value = value;
       this.percentage =-1;
   };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage= Math.round((this.value/totalIncome)*100);
        }else {
            this.percentage =-1;
        }
    };
    
    Expense.prototype.getPercentage =function(){
        return this.percentage;
    }
    
    
    var Income = function(id, description, value) {
       this.id= id;
       this.description = description;
       this.value = value;
    };
    
    var calculateTotal = function(type) {
        //calculate total Inc and Exp
        var sum=0;
        
        data.allItems[type].forEach(function(cur){
           sum += cur.value; 
        });
        data.totals[type] =sum;
    };
    
    var data ={
        allItems:{
            inc : [],
            exp: []
        },
    
        totals : {
            inc: 0,
            exp: 0
        },
        budget : 0,
        percentage : -1
    };
 
    return {
        addItem : function(type,des,val){
            var newItem,Id;
            
            //create new ID
            if(data.allItems[type].length >0 ){
                Id= data.allItems[type][data.allItems[type].length - 1].id+1;
            }else {
                Id=0;
            }
            
            //Create the new item based on 'inc' and 'exp'type
            if(type==='exp'){
                newItem = new Expense(Id,des,val);
            }else if(type==='inc'){
                newItem = new Income(Id,des,val)
            }
            
            //push it into data structure
            data.allItems[type].push(newItem);
            
            //return the new element
            return newItem;
        },
        
        deleteItem : function(type,id) {
            var index,ids;
            
            ids = data.allItems[type].map(function (current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
        },
        
        calculateBudget : function(){
            //calculate total Inc and Exp
            calculateTotal('inc');
            calculateTotal('exp');
            
            //Calculate budget : Inc - Exp
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage
            if( data.totals.inc >0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage =-1;
            }
        },
        
        calculatePercentage : function(){
            
            data.allItems.exp.forEach(function(current){
               current.calcPercentage(data.totals.inc); 
            });
        },
        
        getPercentage :function(){
            var allPer =data.allItems.exp.map(function(current){
                return current.getPercentage();      
            });
            return allPer;
        },
        
        getBudget : function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage:data.percentage
            }
        },
        test : function(){
            console.log(data); 
        }
    };
                      
})();


//UI Controller
var UIController = (function() {
    var domString = {
        inputType :'.add__type',
        inputDecsription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeList : '.income__list',
        expenseList :'.expenses__list',
        budgetLabel :'.budget__value',
        incomeLabel :'.budget__income--value',
        expenseLabel :'.budget__expenses--value',
        percentageLabel :'.budget__expenses--percentage',
        container : '.container',
        percentage : '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num,type){
        var numSplit,int,dec,type;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        
        int =numSplit[0];
        if(int.length >3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        
        dec =numSplit[1];
        
        return(type==='exp'? '-':'+')+' '+int+'.'+dec;
        
    };
     var nodeListForEach =function(list,callback){
                
                for(i=0; i<list.length;i++){
                    callback(list[i],i);
                }
    };
    
    return {
        getInput : function() {
            return {
                type :document.querySelector(domString.inputType).value,// will be wither inc and exp;
                decsription : document.querySelector(domString.inputDecsription).value,
                value : parseFloat(document.querySelector(domString.inputValue).value)
            };
        },
        
        addListItem: function(obj,type){
            var html,newHtml,element;
            
            //Creat a html string with placeholder text
            if(type ==='inc'){
                element= domString.incomeList;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type ==='exp'){
                element = domString.expenseList;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //replace placeholder text with some actual data
            newHtml= html.replace('%id%',obj.id);
            newHtml= newHtml.replace('%description%', obj.description);
            newHtml= newHtml.replace('%value%', formatNumber(obj.value,type));
               
            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        deleteListItem : function(selector){
            var el=document.getElementById(selector);
            el.parentNode.removeChild(el);  
        },
        
        clearFields : function() {
            var fields ,fieldsArr;
            
            fields= document.querySelectorAll(domString.inputDecsription +', '+ domString.inputValue);
            
            fieldsArr =Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current ,index, array){
               current.value=""; 
            }); 
            
            fieldsArr[0].focus();
        },
        
        displayBudget :function(obj){
            
            obj.budget>0? type ='inc': type ='exp';
            
            document.querySelector(domString.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(domString.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(domString.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage >0){
            document.querySelector(domString.percentageLabel).textContent = obj.percentage +'%';
            }else {
                document.querySelector(domString.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentage : function(percentages){
            
            var fileds = document.querySelectorAll(domString.percentage);
              
            nodeListForEach(fileds,function(current, index){
                
                if(percentages[index] >0){
                    current.textContent =percentages[index]+'%';
                }else{
                    current.textContent ='---'
                }
            });
            
        },
        
        displayDate : function (){
            var now, months,month,year;
            
            now = new Date();
            
            months=['January','February','March','April','May','June','July','August','September', 'October','November','December'];
            
            month=now.getMonth();
            year=now.getFullYear();
            
            document.querySelector(domString.dateLabel).textContent=months[month]+' '+year;
            
        },
        
        changeType: function() {
            
            var fields = document.querySelectorAll(
                domString.inputType+','+
                domString.inputDecsription+','+
                domString.inputValue
            );
            
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(domString.inputBtn).classList.toggle('red');
        },
        
        getDomString : function() {
            return domString;
        }
    };
    
    
    
})();


//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDomString();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
       
        if(event.keyCode ===13 || event.which ===13){
            ctrlAddItem();
        }
    });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType); 
    };
    
     
    var upDateBudget = function(){
        //Calculate the budget
        budgetCtrl.calculateBudget();
        
        //Return the budget
        var budget = budgetCtrl.getBudget();
        
        //display the budget on UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentage = function(){
        //Calculate the percentage
        budgetCtrl.calculatePercentage();
        
        //retun the Percentage form budget controller
        var percentages = budgetCtrl.getPercentage();
        
        //display the percenatage
        UICtrl.displayPercentage(percentages); 
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // Get the filled input data
        input = UICtrl.getInput();
        
        if(input.decsription !=="" && !isNaN(input.value) && input.value >0){
            // Add the item budget controller
            newItem=budgetCtrl.addItem(input.type,input.decsription,input.value);

            //Add the item to the UI
            UICtrl.addListItem(newItem,input.type);

            //clear the fiels on ui
            UICtrl.clearFields();

            //Calculate and Update budget
            upDateBudget();

            //calculate the percentage and update  
            updatePercentage();
            
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemId ,splitId,id,type;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            
            //delete the item from the data structure
            budgetCtrl.deleteItem(type,id);
            
            //delete the item from the UI
            UICtrl.deleteListItem(itemId);
            
            //update and show the new budget
            upDateBudget();
            
            //calculate the percentage and update
            updatePercentage();
            
        }
        
    };
   
    return {
        init : function(){
            console.log('application started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage:-1
            });
            setupEventListeners();
        }
    };
    
})(budgetController , UIController);


controller.init();































