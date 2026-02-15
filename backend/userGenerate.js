// this is a script to create test users with hashed passwords for dev db

const bcrypt = require("bcrypt");

const users = [
  // { first: "John", last: "Doe", email: "john.doe@example.com", password: "Password123!" },
  // { first: "Jane", last: "Smith", email: "jane.smith@example.com", password: "Welcome123!" },
  // { first: "Mike", last: "Jordan", email: "mike.jordan@example.com", password: "Basketball23!" },
  // { first: "Sarah", last: "Connor", email: "sarah.connor@example.com", password: "Terminator1!" },
  // { first: "Tony", last: "Stark", email: "tony.stark@example.com", password: "IronMan3000!" },
  // { first: "Bruce", last: "Wayne", email: "bruce.wayne@example.com", password: "DarkKnight7!" },
  // { first: "Peter", last: "Parker", email: "peter.parker@example.com", password: "SpiderWeb8!" },
  // { first: "Clark", last: "Kent", email: "clark.kent@example.com", password: "Krypton9!" },
  // { first: "Diana", last: "Prince", email: "diana.prince@example.com", password: "WonderWoman10!" },
  // { first: "Steve", last: "Rogers", email: "steve.rogers@example.com", password: "Captain1941!" }
  {first: 'Jim', last: 'Beam', email: 'owner@example.com', password: 'jimmyFly!'}
];

(async () => {
  console.log("INSERT INTO users (first_name, last_name, email, password_hash) VALUES\n");

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const hash = await bcrypt.hash(u.password, 10);

    const comma = i === users.length - 1 ? ";" : ",";

    console.log(
      `('${u.first}', '${u.last}', '${u.email}', '${hash}')${comma}`
    );
  }
})();
