# The EDPB website auditing tool

The EDPB website auditing tool collects evidence, classifies data and generates reports regarding trackers that are being used by websites.  It provides a portable and friendly interface based on the [Website Evidence Collector](https://joinup.ec.europa.eu/collection/free-and-open-source-software/solution/website-evidence-collector) with the use of the frameworks [electronjs](https://www.electronjs.org/) and [angular](https://angular.io). It is intended to be used to facilitate website inspections.


# Development information

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Package the application for Mac, Windows or GNU/Linux

### Mac:

You must set the ENV variables `APPLEID` and `APPLEPIAPASSWORD` inside a `.env` file at the root of the project.

```
yarn electron:mac
```

### Windows:

```
CSC_LINK=../path_to_your/file.pfx CSC_KEY_PASSWORD="Your PFX file password" yarn electron:win
```

### GNU/Linux:

```
yarn electron:linux
```