define({ "api": [
  {
    "type": "get",
    "url": "/",
    "title": "Section Welcome response",
    "name": "Section_Welcome_response",
    "group": "Absences",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  message: 'Benvenuto alle API della Web App \"WonderfulCompany\"(sezione assenze), effettua una richiesta valida :)'\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router-absences.js",
    "groupTitle": "Absences",
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/"
      }
    ]
  },
  {
    "type": "post",
    "url": "/users",
    "title": "Add User",
    "name": "Add_User",
    "description": "<p>Creates a new user.</p>",
    "error": {
      "fields": {
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Creation failed.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    success : false,\n    error : \"Creation error\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/users"
      }
    ],
    "group": "General",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "surname",
            "description": "<p>Surname of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"name\": \"Paolino\",\n    \"surname\": \"Paperino\",\n    \"email\": \"paolino@disney.it\",\n    \"password\": \"paolinopaperino\"\n}",
          "type": "json"
        }
      ]
    },
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>True if creation is succesfully.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>String containing the error, it's null if success is true.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"error\": null\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router.js",
    "groupTitle": "General"
  },
  {
    "type": "get",
    "url": "/authenticate",
    "title": "Authenticate",
    "name": "Authenticate",
    "description": "<p>This is the request to get authentication token.</p>",
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401    Unauthorized",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/authenticate"
      }
    ],
    "group": "General",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Basic authenticator &quot;Basic [base-64 encoded string(email:password)]&quot;.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": \"Basic eG1leTk1MkBjaWFvLml0Z2Y6Y2lhb2NpYW8=\"\n}",
          "type": "json"
        }
      ]
    },
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>JWT Access Token.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>True if login is succesfully.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>User object.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.name",
            "description": "<p>User name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.surname",
            "description": "<p>User surname.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.email",
            "description": "<p>User email.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"success\": true,\n   \"user\": {\n      \"name\": \"xmey952\",\n      \"surname\": \"xmey952\",\n      \"email\": \"xmey952@ciao.it\"\n   },\n   \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InhtZXk5NTJAY2lhby5pdCIsImlzc3VlX3RpbWUiOjE1Mjc3ODA3NzczMzksImlhdCI6MTUyNzc4MDc3NywiZXhwIjoxNTI4Mzg1NTc3fQ.2CvVNfk-eDnVKWkLjoB8bp1dmGPqgwUcL4_FkWTy_6c\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router.js",
    "groupTitle": "General"
  },
  {
    "type": "get",
    "url": "/users/:user",
    "title": "Get User",
    "name": "Get_User",
    "description": "<p>Get User info by ID.</p>",
    "error": {
      "fields": {
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Query failed.</p>"
          }
        ],
        "Error 404": [
          {
            "group": "Error 404",
            "optional": false,
            "field": "NotFoundError",
            "description": "<p>Resource not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    success : false,\n    error : \"INTERNAL_SERVER_ERROR\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found Error\n{\n    success : false,\n    error : \"USER_NOT_FOUND\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/user/1"
      }
    ],
    "group": "General",
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>True if the query is succesfully.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>String containing the error, it's null if success is true.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>String containing user object.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"error\": null,\n  \"user\":\n             {\n              \"name\":\"xmey952\",\n              \"surname\":\"xmey952\",\n              \"email\":\"xmey952@ciao.it\"\n             },\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router.js",
    "groupTitle": "General"
  },
  {
    "type": "get",
    "url": "/users",
    "title": "Get Users",
    "name": "Get_Users",
    "description": "<p>Get the list of users.</p>",
    "error": {
      "fields": {
        "Error 500": [
          {
            "group": "Error 500",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>Query failed.</p>"
          }
        ],
        "Error 404": [
          {
            "group": "Error 404",
            "optional": false,
            "field": "NotFoundError",
            "description": "<p>Resource not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    success : false,\n    error : \"INTERNAL_SERVER_ERROR\"\n }",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found Error\n{\n    success : false,\n    error : \"USERS_NOT_FOUND\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/users"
      }
    ],
    "group": "General",
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>True if the query is succesfully.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "error",
            "description": "<p>String containing the error, it's null if success is true.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users",
            "description": "<p>String containing list of users.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"error\": null,\n  \"users\": [\n             {\n              \"name\":\"xmey952\",\n              \"surname\":\"xmey952\",\n              \"email\":\"xmey952@ciao.it\"\n             },\n             {\n              \"name\":\"xmey95\",\n              \"surname\":\"xmey95\",\n              \"email\":\"xmey95@ciao.it\"\n             }\n            ]\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router.js",
    "groupTitle": "General"
  },
  {
    "type": "get",
    "url": "/",
    "title": "API Root",
    "name": "WonderfulCompany_Welcome_response",
    "group": "General",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  message: 'Benvenuto alle API della Web App \"WonderfulCompany\", effettua una richiesta valida :)'\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router.js",
    "groupTitle": "General",
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/"
      }
    ]
  },
  {
    "type": "get",
    "url": "/",
    "title": "Section Welcome response",
    "name": "Section_Welcome_response",
    "group": "Rooms",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  message: 'Benvenuto alle API della Web App \"WonderfulCompany\"(sezione aulario), effettua una richiesta valida :)'\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router-rooms.js",
    "groupTitle": "Rooms",
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/"
      }
    ]
  },
  {
    "type": "get",
    "url": "/",
    "title": "Section Welcome response",
    "name": "Section_Welcome_response",
    "group": "Surveys",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  message: 'Benvenuto alle API della Web App \"WonderfulCompany\"(sezione sondaggi), effettua una richiesta valida :)'\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "api/routes/router-surveys.js",
    "groupTitle": "Surveys",
    "sampleRequest": [
      {
        "url": "https://github.com/xmey95/worderfulcompany/"
      }
    ]
  }
] });
