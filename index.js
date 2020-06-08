const express = require("express");
const server = express();
const db = require("./data/db");
const cors = require("cors");

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Node API1");
});

server.post("/api/users", (req, res) => {
  console.log(req.body.bio);
  if (!isValidUser(req.body)) {
    res
      .status(400)
      .json({ errorMessage: "Please provide name and bio for the user." });
  } else {
    db.insert({ name: req.body.name, bio: req.body.bio })
      .then(id =>
        db
          .findById(id.id)
          .then(user => res.status(201).json(user))
          .catch({
            error: "There was an error while saving the user to the database"
          })
      )
      .catch(err =>
        res.status(500).json({
          error: "There was an error while saving the user to the database"
        })
      );
  }
});

server.get("/api/users", (req, res) => {
  db.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "The users information could not be retrieved." })
    );
});

server.get("/api/users/:id", (req, res) => {
  const id = req.params.id;

  db.findById(id)
    .then(user => {
      user
        ? res.status(200).json(user)
        : res.status(404).json({
            message: "The user with the specified ID does not exist."
          });
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: "The user information could not be retrieved." })
    );
});

server.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;

  db.remove(id)
    .then(deleted =>
      deleted
        ? res.status(202).send({ message: "Resource deleted successfully" })
        : res
            .status(404)
            .json({ message: "The user with the specified ID does not exist." })
    )
    .catch(err =>
      res.status(500).json({ error: "The user could not be removed" })
    );
});

server.put("/api/users/:id", (req, res) => {
  const id = req.params.id;

  if (!req.body.name || !req.body.bio) {
    res
      .status(400)
      .json({ errorMessage: "Please provide name and bio for the user." });
  } else {
    db.update(id, { name: req.body.name, bio: req.body.bio })
      .then(updated => {
        updated
          ? db
              .findById(id)
              .then(user => res.status(200).json(user))
              .catch(err => res.status(500).json(err.message))
          : res.status(404).json({
              message: "The user with the specified ID does not exist."
            });
      })
      .catch(err => res.status(500).json(err.message));
  }
});

function isValidUser(user) {
  const { name, bio } = user;

  return name && bio;
}

server.listen(8000, () => {
  console.log("Listening on port 8000");
});
