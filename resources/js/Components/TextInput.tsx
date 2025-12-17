import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    // 1. Selalu gunakan ref lokal untuk memanipulasi elemen DOM di dalam komponen ini
    const localRef = useRef<HTMLInputElement>(null);

    // 2. Hubungkan localRef ke ref induk (jika ada) menggunakan useImperativeHandle
    // Ini mengatasi error "Property current does not exist"
    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ' +
                className
            }
            // 3. Bind input ke localRef, bukan ref dari props langsung
            ref={localRef}
        />
    );
});
