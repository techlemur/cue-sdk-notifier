# cue-sdk-notifier

Simple cli script for changing corsair rgb key colors



## Install

```sh
cd cue-sdk-notifier
npm install
node notify.js -h
```

## cli

```sh
Usage:
  notify.js [OPTIONS] [ARGS]

Options:
  -i, --interactive [BOOLEAN] Interactive mode
  -n, --device [NUMBER]       Device number
  -k, --keyIds [STRING]       Key id's EX: -k "27 38 39 40"
  -e, --keys [STRING]         Easy keys
  -c, --color [STRING]        Hex color (Default is f00)
  -c2, --color2 [STRING]      Hex color (Default is 000)
  -b, --blink [NUMBER]        Number of times to flash keys (Default is 1)
  -d, --delay [NUMBER]        Delay between flashes in milliseconds (Default is
                              1000)
  -d2, --delay2 [NUMBER]      Delay between flashes in milliseconds
  -h, --help                  Display help and usage details
```

