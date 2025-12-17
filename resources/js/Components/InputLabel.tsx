export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: any) {
    return (
        <label
            {...props}
            className={`block text-sm font-medium text-gray-700 ` + className}
        >
            {value ? value : children}
        </label>
    );
}
