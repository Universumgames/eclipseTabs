#!/bin/bash

printHelp(){
    echo "Helper script to export all important files into zip files"
    echo "usage: ./export.sh [all|src|main] filenameprefix"
    echo "Subcommands:"
    echo "all:"
    echo "   Export progam into two zip files: one containing the programm, the other containing the source files"
    echo "src:"
    echo "   Export only the sources"
    echo "main:"
    echo "   Export only the program files"
    echo "help or \"no arguments\":"
    echo "   opens this view"

}

compressSource(){
    ECLIPSE_EXPORT_SRC_FILE="${1}_src.zip"
    zip -r -q "${ECLIPSE_EXPORT_SRC_FILE}" * -x *.zip '*.git*' 'node_modules/*'
    echo "Source files zippen in ${ECLIPSE_EXPORT_SRC_FILE}"
}

compressProgram(){
    echo "Compiling (transpiling) source"
    tsc 
    echo "Transpiled!!"
    ECLIPSE_EXPORT_PROG_FILE="${1}.zip"
    zip -r -q "${ECLIPSE_EXPORT_PROG_FILE}" compiled/* icons/* pages/* manifest.json style/*
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