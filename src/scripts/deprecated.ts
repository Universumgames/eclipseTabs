function Deprecated(): MethodDecorator {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
        const original = descriptor.value
        descriptor.value = (...args: any) => {
            console.warn(`Warning: ${String(key)} is deprecated`)
            original(...args)
        }
        return descriptor
    }
}
