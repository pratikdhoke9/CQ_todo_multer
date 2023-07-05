const items = document.getElementById('items');
const task = document.getElementById('task');
const task_edit = document.getElementById('task_edit')
var isEditing = false;
var editIndex;
var dataLength=0;

getData(function(todos){
    dataLength=todos.length;
    var index = 0;
    todos.forEach((todo) => {
        let value = todo.task;
        let filename = todo.filename;
        var unit_item = document.createElement('div');
        unit_item.setAttribute('id',index);
        unit_item.setAttribute('class','unit_div')
        var str='';
        if(todo.done){
            str = `
                <img src="${filename}" class="profile"/>
                <span><input id="checkbox" type="checkbox" onclick="makeLineThrough(this)" checked> </span>
                <span style="text-decoration: line-through">${value}</span>
                <button id="delete" type="reset" onclick="deleteTask(this)">X</button>
                <span id="edit" onclick="editTask(this)">&#x270E</span>
            `
        }
        else{
            str = `
                <img src="${filename}" class="profile"/>
                <span><input id="checkbox" type="checkbox" onclick="makeLineThrough(this)"> </span>
                <span >${value}</span>
                <button id="delete" type="reset" onclick="deleteTask(this)" >X</button>
                <span id="edit" onclick="editTask(this)">&#x270E</span>
            `
        }
        unit_item.innerHTML = str;
        items.appendChild(unit_item);
        index++;
    });
})

function getData(callback){
    var request = new XMLHttpRequest();
    request.open("GET","/gettodo");
    
    request.send();
    request.addEventListener('load',function(){
        callback(JSON.parse(request.responseText));
    })
}

function saveData(value,callback){
    var form = document.getElementById('form');
    var formData = new FormData(form);
    var request = new XMLHttpRequest();
    request.open("POST","/save");
    // request.setRequestHeader('Content-Type',"application/json");
    request.send(formData);
    request.addEventListener('load',function(){
        //console.log('filename received in req.responseText');
        request.status === 200 && callback(request.responseText);
    })
}
function editData(value,callback){
    var form = document.getElementById('form');
    var formData = new FormData(form);
    formData.append("index", editIndex);
    var request = new XMLHttpRequest();
    request.open('POST', "/edit")
    
    console.log('sending request');

    request.send(formData);
    request.addEventListener( 'load',function(){
        request.status ===200 && callback(request.responseText);
    })
}

function deleteData(element,callback){
    var request = new XMLHttpRequest();
    request.open("GET","/gettodo");
    
    request.addEventListener('load',function(){
        callback(JSON.parse(request.responseText));
    })
    request.send();
}

function deleteTask(element){
    dataLength--;
    var idx = parseInt(element.parentNode.id);
    var request = new XMLHttpRequest();
    request.open("post",`/delete`);
    request.setRequestHeader('Content-Type',"text/plain");
    request.send(JSON.stringify(idx));
    request.addEventListener('load',function(){

        deleteData(element,function(todos){
            var index = 0;
            items.innerHTML ='';
            todos.forEach((todo) => {
                let value = todo.task;
                let filename = todo.filename
                console.log(value, " ", filename);
                var unit_item = document.createElement('div');
                unit_item.setAttribute('id',index)
                unit_item.setAttribute("class","unit_div")
                var str='';
                if(todo.done){
                    str = `
                        <img src="${filename}" class="profile"/>
                        <span><input id="checkbox" type="checkbox" onclick="makeLineThrough(this)" checked> </span>
                        <span style="text-decoration: line-through">${value}</span>
                        <button id="delete" type="reset" onclick="deleteTask(this)">X</button>
                        <span id="edit" onclick="editTask(this)">&#x270E</span>
                    `
                }
                else{
                    str = `
                        <img src="${filename}" class="profile"/>
                        <span><input id="checkbox" type="checkbox" onclick="makeLineThrough(this)"> </span>
                        <span >${value}</span>
                        <button id="delete" type="reset" onclick="deleteTask(this)" >X</button>
                        <span id="edit" onclick="editTask(this)">&#x270E</span>
                    `
                }
                unit_item.innerHTML = str;
                items.appendChild(unit_item);
                index++;
            });
        });
    })
}

function makeLineThrough(element){
    var idx = parseInt(element.parentNode.parentNode.id);
    var request = new XMLHttpRequest();
    request.open("post",`/makeLine`);
    request.setRequestHeader('Content-Type',"text/plain");
    request.addEventListener('load',function(){
        getData(function(todos){
            if(todos[idx].done === true){
                var text =  document.getElementById(`${idx}`).childNodes[5];
                text.style.textDecoration = 'line-through';
            }
            else{
                var text =  document.getElementById(`${idx}`).childNodes[5];
                text.style.textDecoration = 'none';
            }
        });
    });
    request.send(idx);
}

function editTask(element){
    isEditing = true;
    editIndex = element.parentNode.id;
    var element = document.getElementById(`${editIndex}`).childNodes;
    task.value = element[5].innerHTML;
}

const submit = document.getElementById('submit');
submit.addEventListener('click',function(e){
    e.preventDefault();
    var form = document.getElementById('form');
    var value = form.childNodes[3].value;
    value = value.trim();
    if(value==='')return;
    if(!isEditing)
    {
        saveData(value,function(filename){
            var unit_item = document.createElement('div');
            unit_item.setAttribute("id",`${dataLength}`)
            unit_item.setAttribute("class","unit_div")
            str = `
                <img src="${filename}" class="profile"/>
                <span><input id="checkbox" type="checkbox" onclick="makeLineThrough(this)"> </span>
                <span>${value}</span>
                <button id="delete" type="reset" onclick="deleteTask(this)">X</button>
                <span id="edit" onclick="editTask(this)">&#x270E</span>
            `
            unit_item.innerHTML = str;
            dataLength++;
            items.appendChild(unit_item);
        })
        task.value = "";
    }
    else{
        editData(value,function(filename){
            var oldTask = document.getElementById(editIndex);
            var newTask = document.createElement('div');
            newTask.setAttribute("id",`${editIndex}`);
            newTask.setAttribute("class","unit_div");
            str = `
                <img src="${filename}" class="profile"/>
                <span><input id="checkbox" type="checkbox" onclick="makeLineThrough(this)"> </span>
                <span>${value}</span>
                <button id="delete" type="reset" onclick="deleteTask(this)">X</button>
                <span id="edit" onclick="editTask(this)">&#x270E</span>
            `
            newTask.innerHTML = str;
            oldTask.replaceWith(newTask);
            isEditing = false;
        });
        task.value ='';
    }
})