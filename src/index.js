const express = require("express");
const { uuid, isUuid } = require('uuidv4');

const app = express();  
app.use(express.json());

function logRequest(req, res, next) {
    const { method, url } = req;

    const logLabel = `[${method.toUpperCase()}] ${url}`;

    console.time(logLabel);
    next();
    console.timeEnd(logLabel);
}

function validateProjectId(req, res, next) {
    const { id } = req.params;

    if(!isUuid(id)) {
        return res.status(400).json({ error: `Invalid Project ID: ${id}`})
    }
    return next();
}

app.use(logRequest);
app.use('/projects/:id', validateProjectId);

const projects=[];

app.get('/projects', (req, res) =>{
    const { title } = req.query;

    const results = title 
        ? projects.filter(project => project.title.toLowerCase().includes(title.toLowerCase()))
        : projects;

    return res.json(results);
});

app.post('/projects', (req, res) => {
    const {title, owner, cpf} = req.body;

    const project = { id: uuid(), title, owner, cpf };

    projects.push(project);
    
    return res.json(project);
});

app.put('/projects/:id', (req, res) => {
    const { id } = req.params; 
    const {title, owner, cpf} = req.body;

    const projectIndex = projects.findIndex(project => project.id === id);

    if(projectIndex < 0 ){
        return res.status(400).json({ message: `Project: ${id}. Not found` })
    }
    if(req.body.length === 0) {
        return res.status(500).json({ message: "No body set"});
    }

    const project = {
        id, title, owner, cpf
    }
    projects[projectIndex] = project;

    return res.json({ project });
});

app.delete('/projects/:id', (req, res) => {
    const { id } = req.params;
    const projectIndex = projects.findIndex(project => project.id === id);

    if(projectIndex < 0 ){
        return res.status(400).json({ message: " Project not found. "})
    }

    projects.splice(projectIndex, 1);

    return res.status(204).send();
})

app.listen(3333, ()=> {
    console.log('Back-end started')
});