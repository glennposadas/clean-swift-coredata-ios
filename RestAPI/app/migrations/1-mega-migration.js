'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Users", deps: []
 * createTable "Properties", deps: [Users]
 * createTable "Missions", deps: [Users, Properties]
 * createTable "Orders", deps: [Missions, Users]
 * createTable "PropertyAddresses", deps: [Properties]
 * createTable "PropertyAssets", deps: [Missions]
 * createTable "Roles", deps: [Users]
 * createTable "StripeUsers", deps: [Users]
 * createTable "UserTypes", deps: [Users]
 *
 **/

var info = {
    "revision": 1,
    "name": "mega-migration",
    "created": "2020-07-26T10:38:25.892Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "Users",
                {
                    "id": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "id",
                        "primaryKey": true,
                        "unique": true,
                        "autoIncrement": true,
                        "allowNull": false
                    },
                    "fbId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "fbId"
                    },
                    "googleid": {
                        "type": Sequelize.STRING,
                        "field": "googleid"
                    },
                    "email": {
                        "type": Sequelize.STRING,
                        "field": "email"
                    },
                    "firstName": {
                        "type": Sequelize.STRING,
                        "field": "firstName"
                    },
                    "lastName": {
                        "type": Sequelize.STRING,
                        "field": "lastName"
                    },
                    "password": {
                        "type": Sequelize.STRING,
                        "field": "password"
                    },
                    "photoUrl": {
                        "type": Sequelize.STRING,
                        "field": "photoUrl"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "Properties",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "completeAddress": {
                        "type": Sequelize.STRING,
                        "field": "completeAddress"
                    },
                    "isActive": {
                        "type": Sequelize.BOOLEAN,
                        "field": "isActive"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "Missions",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "shortDescription": {
                        "type": Sequelize.STRING,
                        "field": "shortDescription"
                    },
                    "status": {
                        "type": Sequelize.ENUM('inProgress', 'done'),
                        "field": "status",
                        "defaultValue": "inProgress",
                        "allowNull": false
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "allowNull": true
                    },
                    "propertyId": {
                        "type": Sequelize.BIGINT,
                        "field": "propertyId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Properties",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "Orders",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "paymentOption": {
                        "type": Sequelize.STRING,
                        "field": "paymentOption"
                    },
                    "amount": {
                        "type": Sequelize.INTEGER,
                        "field": "amount"
                    },
                    "currency": {
                        "type": Sequelize.STRING,
                        "field": "currency"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "missionId": {
                        "type": Sequelize.BIGINT,
                        "field": "missionId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Missions",
                            "key": "id"
                        },
                        "allowNull": true
                    },
                    "userId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "PropertyAddresses",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "street": {
                        "type": Sequelize.STRING,
                        "field": "street"
                    },
                    "city": {
                        "type": Sequelize.STRING,
                        "field": "city"
                    },
                    "state": {
                        "type": Sequelize.STRING,
                        "field": "state"
                    },
                    "country": {
                        "type": Sequelize.STRING,
                        "field": "country"
                    },
                    "zipCode": {
                        "type": Sequelize.STRING,
                        "field": "zipCode"
                    },
                    "instructions": {
                        "type": Sequelize.STRING,
                        "field": "instructions"
                    },
                    "latitude": {
                        "type": Sequelize.FLOAT,
                        "field": "latitude"
                    },
                    "longitude": {
                        "type": Sequelize.FLOAT,
                        "field": "longitude"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "propertyId": {
                        "type": Sequelize.BIGINT,
                        "field": "propertyId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Properties",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "PropertyAssets",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "url": {
                        "type": Sequelize.STRING,
                        "field": "url"
                    },
                    "title": {
                        "type": Sequelize.STRING,
                        "field": "title"
                    },
                    "caption": {
                        "type": Sequelize.STRING,
                        "field": "caption"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "missionId": {
                        "type": Sequelize.BIGINT,
                        "field": "missionId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Missions",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "Roles",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "role": {
                        "type": Sequelize.ENUM('user', 'admin'),
                        "field": "role"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "StripeUsers",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "stripeCustomerId": {
                        "type": Sequelize.STRING,
                        "field": "stripeCustomerId"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "UserTypes",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "autoIncrement": true,
                        "primaryKey": true,
                        "allowNull": false
                    },
                    "type": {
                        "type": Sequelize.ENUM('customer', 'photographer'),
                        "field": "type"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT.ZEROFILL.UNSIGNED,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "Users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["Missions", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Orders", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Properties", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["PropertyAddresses", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["PropertyAssets", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Roles", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["StripeUsers", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Users", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["UserTypes", {
                transaction: transaction
            }]
        }
    ];
};

module.exports = {
    pos: 0,
    useTransaction: true,
    execute: function(queryInterface, Sequelize, _commands)
    {
        var index = this.pos;
        function run(transaction) {
            const commands = _commands(transaction);
            return new Promise(function(resolve, reject) {
                function next() {
                    if (index < commands.length)
                    {
                        let command = commands[index];
                        console.log("[#"+index+"] execute: " + command.fn);
                        index++;
                        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                    }
                    else
                        resolve();
                }
                next();
            });
        }
        if (this.useTransaction) {
            return queryInterface.sequelize.transaction(run);
        } else {
            return run(null);
        }
    },
    up: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, migrationCommands);
    },
    down: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, rollbackCommands);
    },
    info: info
};
