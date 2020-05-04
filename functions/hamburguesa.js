var express = require('express');
const functions = require('firebase-functions');
const BASEURL = require('./settings.js');
const admin = require('firebase-admin');



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
        if (url.length < 2 || url[1] === "")
        {
          try {
            const noteSnapshot = await db.collection('hamburguesa').get();
            const notes = [];
            noteSnapshot.forEach((doc) => {
                  notes.push(doc.data());
            });
            res.status(200).send(notes);
          } catch (error) {
            res.status(500).send("error en el servidor")
          }
        } else {
            // eslint-disable-next-line eqeqeq
            if (url[1] == parseInt(url[1])) {
                const noteSnapshot = await db.collection('hamburguesa').where("id", "==", parseInt(url[1]))
                    .get().then(noteSnapshot => {
                      if (!noteSnapshot.empty) {
                        noteSnapshot.forEach((doc) => {
                          console.log(doc.data())
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
            let {nombre, precio, descripcion, imagen} = req.body;
            let id = Math.floor(Math.random() * 100000000);
            const ref = await db.collection('hamburguesa').add({
                id,
                nombre,
                precio,
                descripcion,
                imagen,
                ingredientes: [],
            });
            res.status(201).send({id, nombre, precio, descripcion, imagen, ingredientes: []})
        } catch (error) {
          res.status(400).send("Input invalido");
        }

      } 
      else if (req.method === 'PUT') {
            const url = req.url.split("/");
            if (url[2] === "ingrediente"){
              // eslint-disable-next-line eqeqeq
                if ((url[1] == parseInt(url[1])) && (url[3] == parseInt(url[3]))) {  
                      console.log("holaaa")
                      let ingrediente = await db.collection('ingrediente').where("id", "==", parseInt(url[3])).get()
                      if (ingrediente.empty) {
                        res.status(400).send("ingrediente inexistente")
                      }
                      const ingredienteId = url[3]
                      const hamburguesa = await db.collection('hamburguesa').where("id", "==", parseInt(url[1])).get()
                      let hamburguesaId = 0
                      let ingredienteUrl = ""
                      if (!hamburguesa.empty) {
                        hamburguesa.forEach((doc) => {
                            hamburguesaId = doc.id
                            ingredienteUrl = req.protocol+"://" + req.headers.host + BASEURL.BASEURL +"/ingrediente/" + url[3]
                        })
                        ingredienteUrl = {"path": ingredienteUrl}
                        await db.collection('hamburguesa').doc(hamburguesaId).update({
                          ingredientes: admin.firestore.FieldValue.arrayUnion(ingredienteUrl)}, { merge: true })
                        res.status(201).send("put realizado") 
                      } else {
                        res.status(400).send("hamburguesa inexistente2") 
                      }               
                } else {
                    res.status(400).send("Id hamburgesa invalido")
                }
            }
      }
      else if (req.method === 'PATCH') {
        const url = req.url.split("/");
        // eslint-disable-next-line eqeqeq
        if ((url[1] == parseInt(url[1])) && (url[1] !== "")) {
          let hamburguesaId = 0
          const hamburguesa = await db.collection('hamburguesa').where("id", "==", parseInt(url[1])).get()
          if (hamburguesa.empty){
            res.status(404).send("hamburgesa inexistente")
          } else {
              hamburguesa.forEach((doc) => {
              hamburguesaId = doc.id
          })
          const body = req.body
          console.log("hola")

          await db.collection('hamburguesa').doc(hamburguesaId).update(
            body)
          }
          console.log("hola2")
          console.log(hamburguesaId)
          await db.collection('hamburguesa').doc(hamburguesaId).get()
          .then((data)=>{
            console.log("hola3")
            res.status(200).json(data.data())
            return
          })
        } else {
          res.status(400).send("Id hamburgesa invalido")
        }
      }
      else if (req.method === 'DELETE') {
        const url = req.url.split("/")
        if (url.length < 2 || url[1] === "") {        
          res.status(404).send("Falta id de Hamburguesa"); 
        // eslint-disable-next-line eqeqeq
        } else if (url[1] == parseInt(url[1]) && (url[3] == parseInt(url[3]) )) {  
          console.log("holaaa")
          let ingrediente = await db.collection('ingrediente').where("id", "==", parseInt(url[3])).get()
          if (ingrediente.empty) {
            res.status(400).send("ingrediente inexistente")
          } else {
            const ingredienteId = url[3]
            const hamburguesa = await db.collection('hamburguesa').where("id", "==", parseInt(url[1])).get()
            let hamburguesaId = 0
            let ingredienteUrl = ""
            if (!hamburguesa.empty) {
              hamburguesa.forEach((doc) => {
                  hamburguesaId = doc.id
                  ingredientes = doc.data().ingredientes
                  ingredienteUrl = req.protocol+ "://" + req.headers.host + BASEURL.BASEURL + "/ingrediente/" + url[3]
              })
              ingredienteUrl = {"path": ingredienteUrl}
              console.log(ingredienteUrl)
              console.log(ingredientes)
              esta = false
              ingredientes.forEach((ing) => {
                if (ing.path === ingredienteUrl.path) {
                  esta = true
                }
              })
              if (esta){
                await db.collection('hamburguesa').doc(hamburguesaId).update({
                  ingredientes: admin.firestore.FieldValue.arrayRemove(ingredienteUrl)}, { merge: true }).then(res.status(200).send("ingrediente retirado"))
              } else {
                res.status(404).send("ingrediente inexistente en hamburguesa")
              }
            
            } else {
              res.status(400).send("hamburguesa inexistente") 
            }    
          }            
        } else {
            // eslint-disable-next-line eqeqeq
            if (url[1] == parseInt(url[1])) {
                let id = "non"
                const noteSnapshot = await db.collection('hamburguesa').where("id", "==", parseInt(url[1]))
                    .get().then(noteSnapshot => {
                        noteSnapshot.forEach((doc) => {
                        id = doc.id
                        })
                        return
                    })
                    if (id !== "non") {
                        await db.collection('hamburguesa').doc(id).delete();
                        res.status(200).send("hamburguesa elimidado")
                    } else {
                        res.status(404).send("hamburguesa inexistente")
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


