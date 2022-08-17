# cdb-cli

Command line tool for interacting with CouchDB

## Table of contents

- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Database functions](#database-functions)
  - [Create database](#create-database)
  - [Delete database](#delete-database)
  - [Get database info](#get-database-info)
  - [Get all databases](#get-all-databases)
  - [Replicate database](#replicate-database)
- [Document functions](#document-functions)
  - [Insert document](#insert-document)
  - [Delete document](#delete-document)
  - [Read document](#read-document)
  - [Update document](#update-document)
- [Miscellaneous functions](#miscellaneous-functions)
  - [Help](#help)
  - [Version](#version)

## Getting started

### Installation

```sh
npm i -g cdb-cli
```

### Configuration

Upon installation a default URL, default credentials, and default database will be set for you.

The URL is set to `http://localhost:5984`,the credentials are set to `admin:pass`, and the database is set to an empty string (meaning that no default database is set).

You can edit them with the following commands:

```
cdb set --url http://mycustomurl.com/
cdb set --auth username:password
cdb set --database example

# setting multiple defaults at the same time
cdb set --url http://mycustomurl.com --auth username:password
```

## Database functions

### Create database

`database` - the name of the database

```
cdb create database
```

### Delete database

`database` - the name of the database

```
cdb destroy database
```

### Get database info

`database` - the name of the database

```
cdb info database
```

### Get all databases

```
cdb all
```

### Replicate database

`source` - the name of the database to be replicated

`target` - the name of the database to replicate to

If the target database does not exist then it will be created before replicating.

```
cdb replicate source target
```

## Document functions

### Insert document

`database` - the name of the database

`document` - the document as a JSON string or the relative path to the JSON document

```
cdb insert database document
```

### Delete document

`database` - the name of the database

`document` - the ID of the document

```
cdb delete database document
```

### Read document

`database` - the name of the database

`document` - the ID of the document

```
cdb read database document
```

### Update document

`database` - the name of the database

`document` - the updated document

```
cdb update database document
```

## Miscellaneous functions

### Help

```
# any of these will work
cdb help
cdb --help
cdb -h
```

### Version

```
# any of these will work
cdb version
cdb --version
cdb -v

```
