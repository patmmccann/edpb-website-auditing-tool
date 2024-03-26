# Tutorial for translating the EDPB Website Auditing Tool (WAT)

## Creating the translation file
#### Copy the file content from en.json
In the [language folder (i18n)](https://code.europa.eu/edpb/website-auditing-tool/-/tree/main/src/assets/i18n "Language folder") open the english version ([en.json](https://code.europa.eu/edpb/website-auditing-tool/-/blob/main/src/assets/i18n/en.json "en.json")).
Select the text from  the whole document and copy it (`ctrl + C` on Window, `cmd + C` on MacOS or `right click + Copy`)
<br><br>

#### Create a new file  and copy the file content
Go back to the [language folder (i18n)](https://code.europa.eu/edpb/website-auditing-tool/-/tree/main/src/assets/i18n "Language folder") and create new file.
Name this file using the ISO 639-1 standardised nomenclature corresponding to your language on [wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes "en.json"). For example, the french file is named `"fr.json"` and the english one `"en.json"`.
Paste the text you have previously copied (`ctrl + V` on Window, `cmd + V` on MacOS or `right click + Paste`) in the file.
Texts to translate are the ones __between quotation marks after the colon__.
<br><br>

#### Reference the file in the source code of the WAT
Open the [language loader code (i18n)](https://code.europa.eu/edpb/website-auditing-tool/-/tree/main/src/assets/i18n "Language loader") and load the file as follow :

```js
import (language code) from '../../../assets/i18n/(language file)';
```

for instance for French :
```js
import fr from '../../../assets/i18n/fr.json';
```

Then include you language in the dictionnary availableLanguages in the same file. For instance, for French and English:

```js
static availableLanguages :any =  {
    'en' :en,
    'fr' :fr
  }
```

Add your language name in the `"languages"` section of all other language documents. For example, the french `"fr"` key in `"en.json"` should be name `"French"`.
<br><br>

## Translating the help documents
#### Copy all files from assets

In the [assets folder (files)](https://code.europa.eu/edpb/website-auditing-tool/-/tree/main/src/assets/files "Files folder") copy all english version of the help files (ending by '_en.html'). Rename the end of these files using the same ISO 639-1 standardised nomenclature corresponding to your language on [wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) as previously. You can now translate these files.
<br><br>

#### Reference these files in the source code of the WAT

Open the [language loader code for help](https://code.europa.eu/edpb/website-auditing-tool/-/tree/main/src/app/modules/others/home/home.component.ts "Help loader") and add a new case corresponding to your language in the following lines :

```js
    switch(this.translateService.currentLang){
      default:
        fileTranslation = 'en';
        break;
    }
```

for instance for French :
```js
switch(this.translateService.currentLang){
      case 'fr':
        fileTranslation = 'fr';
        break;
      default:
        fileTranslation = 'en';
        break;
    }
```

<br><br>