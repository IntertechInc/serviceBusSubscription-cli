# serviceBusSubscription-cli
A simple command line tool to create new service bus subscriptions

## Usage

```
$ createSubscription.exe -t <topic> -s <subscription> -f <filter> -c "<connectionString>"
```

## Development

```
$ npm install
$ node index.js -h
```

To package into a native executable you must install [jxcore](http://jxcore.com/home/) and then run:

```
$ jx package index.js "createSubscription" -native
```
