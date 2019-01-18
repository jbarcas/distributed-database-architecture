const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const should = chai.should();

chai.use(chaiHttp);

// So that the logging isn't so verbose
process.env.NODE_ENV = "test";

describe("routes : index", () => {
  describe("GET /does/not/exist", () => {
    it("should throw an error", done => {
      chai
        .request(app)
        .get("/does/not/exist")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(404);
          res.type.should.equal("text/html");
          done();
        });
    });
  });

  describe("POST user", () => {
    it("should not save an user with malformed body", done => {
      const user = {
        email: "john.doe@gmail.com",
        group: 12345
      };
      chai
        .request(app)
        .post("/api/users")
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.type.should.equal("application/json");
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });

    it("should save an user", done => {
      const user = {
        id: "foo",
        name: "John Doe",
        email: "john.doe@gmail.com",
        group: 12345
      };
      chai
        .request(app)
        .post("/api/users")
        .send(user)
        .end((err, res) => {
          res.status.should.equal(201);
          res.type.should.equal("application/json");
          res.body.should.be.a("object");
          res.body.should.have.property("id");
          res.body.should.have.property("name");
          res.body.should.have.property("email");
          res.body.should.have.property("group");
          done();
        });
    });
  });

  describe("DELETE user", () => {
    it("should delete an user", done => {
      chai
        .request(app)
        .del("/api/users/foo")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(204);
          res.type.should.equal("");
          done();
        });
    });
  });
});
