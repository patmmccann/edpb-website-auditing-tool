# About EDPB Website Auditing Tool

## Overview

The EDPB WAT is developed by Jérôme GORIN for the European Data Protection Board under an SPE project contract. It is a Free Software project, aiming to provide a tool to collect evidence, analyse them and generate reports regarding trackers that are being used by websites. It is intended to be used to facilitate website inspections.

The EDPB WAT is licensed under the European Union Public License (EUPL) 1.2+. 

Please refer to the end-user documentation in the ./doc folder to get information about its use.

## Based on Open-Source Projects

This software builds upon the work of several open-source projects, integrating, adapting or calling features for enhanced functionality:

* [Project WEC](https://edps.europa.eu/edps-inspection-software_en): This EDPS command-line tool allows gathering evidence on personal data processing operations of websites using a reproducible, reliable, and fast method. The EDPB WAT project started thanks to the main WEC components, it stays greatly inspired by the WEC. The EDPB WAT allows to visualize audits made with WEC and wish to stay compliant with this project in the future.

* [EasyList](https://easylist.to/): The EasyList project proposes sets of rules originally designed for Adblock (adblock.mozdev.org on WayBackMachine (archive.org)) that automatically remove unwanted content from the internet, including annoying adverts, bothersome banners and troublesome tracking. 
The EDPB WAT uses the EasyPrivacy list and the Fanboy’s Annoyance list.

* [Electron](https://www.electronjs.org/): Electron is a free and open-source software framework developed and maintained by OpenJS Foundation. It allows to build cross-platform desktop apps. The EDPB WAT is written with the Electron framework.

## Contributions and Feedback

The EDPB WAT has been enriched by the feedbacks and contributions from the members of the EDPB, and in particular by the officers participating in the 2023 website auditing Bootcamp. Thank you!

To report issues or suggest improvements, please visit https://code.europa.eu/edpb/website-auditing-tool .

# Installation of the software (release version)
All versions of the software have not (yet) been signed. We therefore encourage you to only use the version on https://code.europa.eu/edpb/website-auditing-tool/-/releases or to compile it yourself. 

For error messages, please refer to the documentation https://code.europa.eu/edpb/website-auditing-tool/-/tree/main/Doc.

# Installation of the project (build version)

Before any of the following steps, make sure that Node.js (minimal version > 20.10.0) and npm is installed on your computer. Run `npm install` to install all dependencies.
In case of memory problem (JavaScript heap out of memory), you can try to increase the amount of memory allocated to your installation of Node.js with the NODE_OPTIONS global variable (e.g. NODE_OPTIONS=--max-old-space-size=8192).

For instance in Linux/macOS terminal : export NODE_OPTIONS=--max-old-space-size=8192

## Build and run the project (electron)

Run `npm run start` to build the project. The build artifacts will be stored in the `dist/` directory. 


## Package the application for Mac, Windows or GNU/Linux
Run `npm run electron:mac` or `npm run electron:win` or `npm run electron:linux` to package the application in electron, depending on the targeted OS. 

## Package the signed application for Mac, Windows or GNU/Linux

### Mac:

You must set the ENV variables `APPLEID`, `APPLEPIAPASSWORD` and `TEAMID` inside a `.env` file at the root of the project.

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

## Build and deploy from a server  (SaaS version)

Run `npm run ng:serve` to test the project on your local server. Run `npm run build:prod` to build the project and serve the build artifacts in the `dist/` directory from a webserver (Apache2 or Nginx) 