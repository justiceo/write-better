# ![logo](assets/images/quill-orange24.png) Write Better 

[![Build Status](https://travis-ci.org/justiceo/write-better.svg?branch=master)](https://travis-ci.org/justiceo/write-better)

An English language grammar checker for Google docs. A.K.A the chrome extension port of [Btford's WriteGood](https://github.com/btford/write-good) which is a bundling of different naive English language linters. I checked for grammatical errors on this README using WriteBetter ;)

![Sample Suggestions](assets/images/screenshot1.png)

### Features
* **Works Offline**: It comes packaged with all the resources needed to parse text, generate and display suggestions on Google docs and under 100Kb in size! See how to [inspect requests made by chrome extensions](https://www.howtogeek.com/302558/how-do-you-monitor-requests-made-by-a-google-chrome-extension/) if you're curious about what data other extensions are sending or requesting.
* **Privacy First**: The texts of your Google docs are never uploaded to a remote server or stored locally. All analysis happen offline and on demand in the browser. See what [can go wrong when extensions make copies of your data](https://gizmodo.com/grammarly-bug-let-snoops-read-everything-you-wrote-onli-1822740378). 
* **Open Source**: You can browse [the code here](https://github.com/justiceo/write-better), [modify and build it yourself](#build-the-extension-locally). It is a stringing of existing open source language libraries. See the [list of libraries](https://github.com/btford/write-good#checks) used.
* **It's Free!**: Sorry I needed to include this given that it costs about $20 to get a pro paper review on services like Fiverr or Grammarly.


#### Upcoming features:
* **Multi-Language Support**: Would allow users to run the checker on any language for which there is an open-source checker, like [Schrieb-gut](https://github.com/TimKam/schreib-gut) for German. 
* **Controlled Annoyance**: Grammar checkers always need to deal with false positive suggestions - it's the nature of English. Goal is to allow user to control confidence level of suggestions to display.
* **Other Writing Surfaces**: At the moment, the extension is [only activated](https://github.com/justiceo/write-better/blob/master/assets/manifest.json#L20) on https://docs.google.com. Generalizing it to other writing surfaces like email would require a bit more effort.


### Build the extension locally

1. Download the repo

```
git clone http://github.com/justiceo/write-better  
```

2. Install dependencies 

```
cd write-better && npm install  
```

3. Build the extension

```
gulp build
```
Extension directory would be in write-better/extension. See how to [load an unpacked extension](https://developer.chrome.com/extensions/getstarted#manifest) in chrome.

### Other tasks

4. Test the extension

```
gulp test
```

5. Start the build in live-reload mode

```
gulp
```

6. Create a release-able extension

```
git checkout -b release                         # Not necessary but preferable.
gulp clean                                      # Remove any artifacts from old builds and watch
gulp build                                      # Build the extension
zip -r extension.zip extension -x "*.DS_Store"  # Zip it up and upload to chrome dashboard.
```

To create .crx file (ensure previous .crx is removed first), use:

```
google-chrome --pack-extension=extension  [--pack-extension-key=<extension_key>]
```

### Debugging

1. Content script can be located in Chrome Devtools -> Sources -> Content Script. Ensure Console output level is VERBOSE
2. Background script can be located in Manage Extensions -> (Find loaded extension) -> Background page.
3. After a rebuild, reload extension using reload button on the extension card at chrome://extensions/


#### PRs to track

1. https://github.com/btford/passive-voice/pull/4
2. https://github.com/duereg/no-cliches/pull/10
3. https://github.com/duereg/too-wordy/pull/5

After which: update btford/write-good's dependencies.



### Feedback
The only way I get feedback is when people complete this [anonymous form](https://forms.gle/LXBcvMG9Vt4fFUen8) or leave a review/comment on the extensions page. Please use them!

### Release Notes
#### v0.0.7
* Fix extension not working on large documents.
* Severally performance improvements and bug fixes.


# Responsive Running lines counter, best implementation from https://stackoverflow.com/a/37623987

```
function countLines(target) {
      var style = window.getComputedStyle(target, null);
      var height = parseInt(style.getPropertyValue("height"));
      var font_size = parseInt(style.getPropertyValue("font-size"));
      var line_height = parseInt(style.getPropertyValue("line-height"));
      var box_sizing = style.getPropertyValue("box-sizing");
      
      if(isNaN(line_height)) line_height = font_size * 1.2;
     
      if(box_sizing=='border-box')
      {
        var padding_top = parseInt(style.getPropertyValue("padding-top"));
        var padding_bottom = parseInt(style.getPropertyValue("padding-bottom"));
        var border_top = parseInt(style.getPropertyValue("border-top-width"));
        var border_bottom = parseInt(style.getPropertyValue("border-bottom-width"));
        height = height - padding_top - padding_bottom - border_top - border_bottom
      }
      var lines = Math.ceil(height / line_height);
      alert("Lines: " + lines);
      return lines;
    }
    countLines(document.getElementById("foo"));
```