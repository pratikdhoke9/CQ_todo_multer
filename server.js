const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const multer = require('multer');
const { log } = require('console');

const upload = multer({dest : 'uploads/'})

const port = 3000;
const app = express();

app.use(function (request,response,next){
    next();
})
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.json());
app.use(bodyParser.text());

app.get('/',function(req,res){
    res.send('hello world')
})

app.get('/gettodo',function(request,response){
    fs.readFile('data.json','utf-8',function(err,data){
        if(err){
            response.send(err);
        }
        else{
            let todos;
            if(data.length === 0){
                todos = []
            }
            else{
                todos = JSON.parse(data)
            }
            
            response.send(todos);
        }
    })
})

app.post('/delete',function(request,response){
    
    fs.readFile('data.json','utf-8',function(err,data){
        
        let todos;
        if(data.length === 0){
            todos = []
        }
        else{
            todos = JSON.parse(data)
        }
        let filename = todos[parseInt(request.body)].filename
        fs.unlink(`uploads/${filename}`,(error)=>{
            if(error){
                console.log(error.toString());
            }
            else{
                console.log(
                    "deleted"
                )
            }
        })

        todos.splice(parseInt(request.body),1);
    
        fs.writeFile('./data.json',JSON.stringify(todos),function(err){
            response.end();
        });
    })
})
app.post('/makeLine',function(request,response){
    fs.readFile('data.json','utf-8',function(err,data){
        let todos;
        if(data.length === 0){
            todos = []
        }
        else{
            todos = JSON.parse(data)
        }
        if(todos[parseInt(request.body)].done===true){
            todos[parseInt(request.body)].done = false;
        }
        else{
            todos[parseInt(request.body)].done = true;
        }
        fs.writeFile('./data.json',JSON.stringify(todos),function(err){
            response.end();
        });
    })
})

app.post('/save', upload.single('profile'),function(request,response){
    console.log(request.body);
    console.log(request.file);
    fs.readFile('data.json','utf-8',function(err,data){
        
        let todos;
        if(data.length === 0){
            todos = []
        }
        else{
            todos = JSON.parse(data)
        }
        todos.push({task: request.body.task, filename: request.file.filename});
        fs.writeFile('./data.json',JSON.stringify(todos),function(err){
            response.send(request.file.filename);
        });
        
    })
})

app.post('/edit',upload.single('profile'),function(request,response){
    fs.readFile('data.json','utf-8',function(err,data){
        let todos;
        if(data.length === 0){
            todos = []
        }
        else{
            todos = JSON.parse(data)
        }
        edit_id = request.body.index;
        value = request.body.task;
        todos[edit_id].task = value;
        todos[edit_id].filename = request.file.filename;
        console.log(todos);
        fs.writeFile('./data.json',JSON.stringify(todos),function(err){
            response.send(request.file.filename);
        });
    })
})
app.listen(port,function(){
    console.log(`listening on ${port}`);
})
