# eclipseTab

This is browser extension for firefox (in the future more browsers will be supported). 
The extension is designed to organize your hundrets of tabs into folders and subfolders. Using it with Firefox you are even capable of hidin tabs from your normal tab view. If all current and future features will be available with other browsers cannot be guaranteed.

This repository is the beta for the newest version of the addon. Final releases will be published on the Firefox Addon Store as well in form of tags in this repository.
<br/>
#### Disclaimer 
<small> The development is primarily focused on improving the extension for Firefox, because that's the browser I primarily use...</small>
<br/>
<br/>

## Installation
The extension was just published on the Moziall Extension store -or whatever you want to call it- and is now avialable for download. To download the extension (you have to use Firefox), go to the [addon page](https://addons.mozilla.org/en-US/firefox/addon/eclipsetabs), click on "add to Firefox", grant the extension the requested permissions and you're ready to go.

### Old-Installation (without the Mozilla Extension/Addon store)

Currently the "installation" process is extremely simple but as simple at it is the short lived it is as well. After each restart of your browser you have to "reinstall" it again, but thhis is only during the development process. In the future it will be easily downloaded and installed through the extension store within your modern web browser.
The only way to install this extension at the moment is either to zip all important files into one folder called ```"eclipseTab.zip"```. Within the folder should be the  ```compiled```(see Compilation) directory where all Javascript files are located, the ```manifest.json``` as well as the ```icons``` directory. To install the extension in Firefox, enable the developer mode within the browser settings and install the extension as a temporary addon either by using the zipped folder or by using the ```manifest.json```.

#### Compilation
If you want to compile the project yourself, just go to the root directory of the project and, if you havee it installed, just run the command `tsc` in the commandline. The transpiled javascript files will be inside the `compiled` folder.