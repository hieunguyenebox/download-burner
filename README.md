# Flash Getter

### Getting Started

Easy to download files, even large files :)))
Open 30 connections to download file if Range Request

### Installing

```
yarn add flash-getter
```
or
```
npm i --save flash-getter
```

### Usage

```
import FlashGetter from 'flash-getter'
// const FlashGetter = require('flash-getter')

FlashGetter
	.download(url, options)
	.then(filepath => console.log(filepath))
	.catch(err => console.log(err))


```


### options
|Key|Value|Default Value
|---|-----|----
|newName|new file name|file name of the url
|headers|custom header|
|dest|directory to store file|current dir

> Return Value
Promise with file path of file on your machine
