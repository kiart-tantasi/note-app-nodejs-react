import React, { useState } from 'react';

export default function useInput(validatingFunction: (input:string) => boolean) {

    const [ inputValue, setInputValue ] = useState("");
    const [ initialized, setInitialized ] = useState(false);

    const errorNoInitialized = validatingFunction(inputValue);
    
    const error = initialized && !validatingFunction(inputValue);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }

    const handleInitialized = () => {
        setInitialized(true);
    }

    return {
        inputValue,
        errorNoInitialized,
        error,
        handleInputChange,
        handleInitialized
    };
}
