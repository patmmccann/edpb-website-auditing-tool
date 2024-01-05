# The EDPB website auditing tool

The EDPB website auditing tool collects evidence, classifies data and generates reports regarding trackers that are being used by websites.  It provides a portable and friendly interface based on the [Website Evidence Collector](https://joinup.ec.europa.eu/collection/free-and-open-source-software/solution/website-evidence-collector) with the use of the frameworks [electronjs](https://www.electronjs.org/) and [angular](https://angular.io). It is intended to be used to facilitate website inspections.

Please refer to the end-user documentation in the ./doc folder to get information about its use.

## Installation

Before any of the following steps, make sure that Node.js (minimal version > 20.10.0) and npm is installed on your computer. Run `npm run start` to install all dependencies.

## Build and run the project

Run `npm run start` to build the project. The build artifacts will be stored in the `dist/` directory. 


## Package the application for Mac, Windows or GNU/Linux
Run `npm run electron:mac` or `npm run electron:win` or `npm run electron:linux` to package the application in electron, depending on the targeted OS. 

## Package the signed application for Mac, Windows or GNU/Linux

### Mac:

You must set the ENV variables `APPLEID` and `APPLEPIAPASSWORD` inside a `.env` file at the root of the project.

```
npm run electron:mac
```

### Windows:

```
CSC_LINK=../path_to_your/file.pfx CSC_KEY_PASSWORD="Your PFX file password" npm run electron:win
```

### GNU/Linux:

```
npm run electron:linux
```

You can refer to [Code Signing](https://www.electron.build/code-signing) to get detailed information on the procedure.


## Development information

### Development server for the interface only

Run `npm run ng:serve` for a dev server of the interface. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Running unit tests

Run `npm run ng:test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.



