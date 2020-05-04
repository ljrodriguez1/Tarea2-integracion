var express = require('express');
const functions = require('firebase-functions');
const BASEURL = require('./settings.js');



exports.handler = async function(req, res, db) {
    try {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Credentials', 'true');
  
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', '*');
        res.set('Access-Control-Allow-Headers', '*');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
      }
      if (req.method === 'GET') {
        const url = req.url.split("/")
        //console.log(req.route)
        if (url.length < 2 || url[1] === "")
        {
          try {
            const noteSnapshot = await db.collection('ingrediente').get();
            const notes = [];
            noteSnapshot.forEach((doc) => {
                  notes.push(doc.data());
            });
            res.status(200).json(notes);
          } catch (error) {
            res.status(500).send("error en el servidor mio")
          }
        } else {
          // eslint-disable-next-line eqeqeq
          if (url[1] == parseInt(url[1])) {

            const noteSnapshot = await db.collection('ingrediente').where("id", "==", parseInt(url[1]))
            .get().then(noteSnapshot => {
              if (!noteSnapshot.empty) {
                noteSnapshot.forEach((doc) => {
                  res.status(200).send(doc.data())
                  return
                })  
                return
              }  else {
                  res.status(404).send("ingrediente inexistente")
                  return
              }  
            })
          } else {
            res.status(400).send("id invalido")
          }
        }
      }  
      else if (req.method === 'POST') {
        try {
          let {nombre, descripcion} = req.body;
          console.log(nombre)
          console.log(descripcion)
          let id = Math.floor(Math.random() * 100000000);
          const ref = await db.collection('ingrediente').add({
            id,
            nombre,
            descripcion,
          });

        res.status(201).send({id, nombre, descripcion})
        } catch (error) {
          res.status(400).send("Input invalido");
        }

      } 
      else if (req.method === 'DELETE') {
        const url = req.url.split("/")
        if (url.length < 2 || url[1] === "") {        
          res.status(404).send("Falta id de Ingrediente");  
        } else {
          // eslint-disable-next-line eqeqeq
          if (url[1] == parseInt(url[1])) {
            let id = "non"
            let ingredienteUrl = req.protocol+ "://" + req.headers.host + BASEURL.BASEURL + "/ingrediente/" + url[1]
            ingredienteUrl = {"path": ingredienteUrl}
            console.log(ingredienteUrl)
            const hamburguesa = await db.collection("hamburguesa").where("ingredientes", 'array-contains', ingredienteUrl).get()
            if (!hamburguesa.empty) {
              console.log("estoy aqui")
              res.status(409).send("ingrediente no se puede borrar, se encuentra presente en una hamburguesa")
            } else {
              const noteSnapshot = await db.collection('ingrediente').where("id", "==", parseInt(url[1]))
                  .get().then(noteSnapshot => {
                      noteSnapshot.forEach((doc) => {
                      id = doc.id
                      })
                      return
                  })
              if (id !== "non") {
                  await db.collection('ingrediente').doc(id).delete();
                  res.status(200).send("ingrediente elimidado")
              } else {
                  res.status(404).send("ingrediente inexistente")
              }
            }
          } else {
            res.status(400).send("id invalido")
          }
        }
      }

    } catch (error) {
      res.status(404).json({ message: error });
    }

};


