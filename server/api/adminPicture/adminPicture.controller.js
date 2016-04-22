/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/adminPictures              ->  index
 * POST    /api/adminPictures              ->  create
 * GET     /api/adminPictures/:id          ->  show
 * PUT     /api/adminPictures/:id          ->  update
 * DELETE  /api/adminPictures/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import AdminPicture from './adminPicture.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of AdminPictures
export function index(req, res) {
  AdminPicture.findAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single AdminPicture from the DB
export function show(req, res) {
  AdminPicture.findOne({"name": req.params.name})
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new AdminPicture in the DB
export function create(req, res) {
  AdminPicture.createAsync(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing AdminPicture in the DB
//
// Working on fixing 500 error
//
export function update(req, res) {
  // if (req.body.name) {
  //   delete req.body.name;
  // }
  // console.log(req.body);
  // console.log(req.params);
  return AdminPicture.findOne({"name": req.params.name}).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a AdminPicture from the DB
export function destroy(req, res) {
  AdminPicture.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
