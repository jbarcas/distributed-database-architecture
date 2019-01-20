const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const should = chai.should();

chai.use(chaiHttp);

describe("API gateway", () => {
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
    it("should not save an user with a malformed payload", done => {
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
        id: "userId",
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
          res.body.should.have.property("id").to.be.a("string");
          res.body.should.have.property("name").to.be.a("string");
          res.body.should.have.property("email").to.be.a("string");
          res.body.should.have.property("group").to.be.a("number");
          done();
        });
    });
  });

  describe("GET user", () => {
    it("should not get a non-existing user", done => {
      chai
        .request(app)
        .get("/api/users/non-existing")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(404);
          res.type.should.equal("application/json");
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          res.body.should.have.property("message").eql("User not found");
          done();
        });
    });

    it("should get an user", done => {
      chai
        .request(app)
        .get("/api/users/userId")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(200);
          res.type.should.equal("application/json");
          res.body.should.have.property("id").eql("userId");
          res.body.should.have.property("name").eql("John Doe");
          res.body.should.have.property("email").eql("john.doe@gmail.com");
          res.body.should.have.property("group").eql(12345);
          done();
        });
    });
  });

  describe("PUT user", () => {
    it("should not modify a non-existing user", done => {
      const user = {
        id: "non-existing",
        name: "John Doe",
        email: "john.doe@gmail.com",
        group: 12345
      };
      chai
        .request(app)
        .put("/api/users/")
        .send(user)
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(404);
          res.type.should.equal("application/json");
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          res.body.should.have.property("message").eql("User not found");
          done();
        });
    });

    it("should modify an user", done => {
      const user = {
        id: "userId",
        name: "John Doe",
        email: "john.doe@yahoo.com",
        group: 12345
      };
      chai
        .request(app)
        .put("/api/users/")
        .send(user)
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(200);
          res.type.should.equal("application/json");
          res.body.should.have.property("id").eql("userId");
          res.body.should.have.property("name").eql("John Doe");
          res.body.should.have.property("email").eql("john.doe@yahoo.com");
          res.body.should.have.property("group").eql(12345);
          done();
        });
    });
  });

  describe("COUNT users", () => {
    it("should count all users", done => {
      chai
        .request(app)
        .get("/api/users/count")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(200);
          res.type.should.equal("application/json");
          res.body.should.be.a("object");
          res.body.should.have.property("count");
          res.body.should.have.property("count").to.be.a("number");
          done();
        });
    });
  });

  describe("LIST users", () => {
    const user = {
      id: "userId",
      name: "John Doe",
      email: "john.doe@yahoo.com",
      group: 12345
    };
    it("should list at least one user", done => {
      chai
        .request(app)
        .get("/api/users")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(200);
          res.type.should.equal("application/json");
          res.body.should.be.an("array").have.lengthOf.above(0);
          done();
        });
    });
  });

  describe("DELETE user", () => {
    it("should not delete a non-existing user", done => {
      chai
        .request(app)
        .del("/api/users/non-existing")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(404);
          res.type.should.equal("application/json");
          res.body.should.be.a("object");
          res.body.should.have.property("name");
          res.body.should.have.property("name").eql("NotFoundError");
          done();
        });
    });

    it("should delete an user", done => {
      chai
        .request(app)
        .del("/api/users/userId")
        .end((err, res) => {
          should.exist(res);
          res.status.should.equal(204);
          res.type.should.equal("");
          done();
        });
    });
  });
});
