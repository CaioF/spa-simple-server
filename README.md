# spa-simple-server [![Build Status](https://travis-ci.com/CaioF/spa-simple-server.svg?branch=master)](https://travis-ci.com/CaioF/spa-simple-server)
Express server created for qoollo.   
The composed docker can be found on [this link](https://hub.docker.com/repository/docker/kraftybox/simple_server_qoollo).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

```
Node.js version >= 10
npm version >= 6
```

### Installing

```
git clone 
cd spa-simple-server/
npm install
```
### Deploying

* `npm run dev` *runs nodemon dev server*
* `node simple-server.js` *runs normal node server*
additionally both the above commands can be followed by `-init` i.e. `node simple-server.js -init` this will initialize and populate the `pseudo-db.json` file with mock data.
* `npm run lint` *runs code linting*
* `npm run test` *runs code testing*


## Built With

* [Node.js](https://nodejs.org/en/)

## Authors

* **Caio Fleury** - *Initial work* - [CaioF](https://github.com/CaioF)

See also the list of [contributors]() who participated in this project.

## License

This project is licensed under the Attribution-NonCommercial-NoDerivatives 4.0 International License - see the [LICENSE.md](LICENSE.md) file for details

