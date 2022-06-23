#!/bin/bash

printHelp(){
    echo "Helper script to export all important files into zip files"
    echo "usage: ./export.sh [all|src|main] filenameprefix"
    echo "Subcommands:"
    echo "all:"
    echo "   Export program into two zip files: one containing the programm, the other containing the source files"
    echo "src:"
    echo "   Export only the sources"
    echo "main:"
    echo "   Export only the program files"
    echo "help or \"no arguments\":"
    echo "   opens this view"

}

compressSource(){
    ECLIPSE_EXPORT_SRC_FILE="${1}_src.zip"
    TMP_SRC_ZIP="temp_src.zip"
    zip -r -q "${TMP_SRC_ZIP}" * -x *.zip '*.git*' 'node_modules/*' 'screenshots/*' 'package-lock.json' '*.code-workspace' '.vscode/*'
    mv "${TMP_SRC_ZIP}" "${ECLIPSE_EXPORT_SRC_FILE}"
    echo "Source files zipped in ${ECLIPSE_EXPORT_SRC_FILE}"
}

compressProgram(){
    echo "Compiling (transpiling) source"
    npx vue-cli-service build
    echo "Project build!!"
    ECLIPSE_EXPORT_PROG_FILE="${1}.zip"
    TMP_PROG_ZIP="temp_prog.zip"
    zip -r -q "${TMP_PROG_ZIP}" dist/* manifest.json Updatelog.md LICENSE README.md howTo.html howTo.md 
    mv "${TMP_PROG_ZIP}" "${ECLIPSE_EXPORT_PROG_FILE}"
    echo "Program files zippen in ${ECLIPSE_EXPORT_PROG_FILE}"
}

case "$1" in
    "all")
        compressSource $2
        compressProgram $2
        echo "All important files compressed"
        ;;
    "src")
        compressSource $2
        ;;
    "main")
        compressProgram $2
        ;;
    "help" | *)
        printHelp
        ;;
esac

exit 0