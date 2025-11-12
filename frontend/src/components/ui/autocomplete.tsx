import {
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
    Command,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { useState, useRef, useCallback, type KeyboardEvent } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { Check, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BaseCommune, BaseCommuneResponse } from "@/models/commune"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"


type AutoCompleteProps = {
    options: BaseCommuneResponse
    emptyMessage: string
    inputValue: string
    setInputValue: (value: string) => void
    value?: BaseCommune
    onValueChange?: (value: BaseCommune) => void
    isLoading?: boolean
    disabled?: boolean
    placeholder?: string
}

export const AutoComplete = ({
    options,
    placeholder,
    emptyMessage,
    inputValue,
    setInputValue,
    value,
    onValueChange,
    disabled,
    isLoading = false,
}: AutoCompleteProps) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const [isOpen, setOpen] = useState(false)
    const [selected, setSelected] = useState<BaseCommune>(value as BaseCommune)

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current
            if (!input) {
                return
            }

            // Keep the options displayed when the user is typing
            if (!isOpen) {
                setOpen(true)
            }

            // This is not a default behaviour of the <input /> field
            if (event.key === "Enter" && input.value !== "") {
                const optionToSelect = options.find(
                    (option) => option.nom === input.value,
                )
                if (optionToSelect) {
                    setSelected(optionToSelect)
                    onValueChange?.(optionToSelect)
                }
            }

            if (event.key === "Escape") {
                input.blur()
            }
        },
        [isOpen, options, onValueChange],
    )

    const handleBlur = useCallback(() => {
        setOpen(false)
        if (selected && inputValue === selected.nom) {
            setInputValue(selected.nom)
        }

    }, [selected])

    const handleSelectOption = useCallback(
        (selectedOption: BaseCommune) => {
            setInputValue(selectedOption.nom)

            setSelected(selectedOption)
            onValueChange?.(selectedOption)

            // This is a hack to prevent the input from being focused after the user selects an option
            // We can call this hack: "The next tick"
            setTimeout(() => {
                inputRef?.current?.blur()
            }, 0)

            setOpen(false)
        },
        [onValueChange],
    )

    return (
        <Command onKeyDown={handleKeyDown} shouldFilter={false} className="sm:flex-1">
            <CommandInput
                ref={inputRef}
                value={inputValue}
                onValueChange={isLoading ? undefined : setInputValue}
                onBlur={handleBlur}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className="text-base"
                asChild
            >
                <InputGroup>
                    <InputGroupInput placeholder={placeholder} value={inputValue} onChange={(e) => e.preventDefault()} />
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                </InputGroup>
            </CommandInput>
            <div className="relative mt-1">
                <div
                    className={cn(
                        "animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none",
                        isOpen ? "block" : "hidden",
                    )}
                >
                    <CommandList className="rounded-lg ring-1 ring-slate-200">
                        {isLoading ? (
                            <CommandPrimitive.Loading>
                                <div className="p-1">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </CommandPrimitive.Loading>
                        ) : null}
                        {options.length > 0 && !isLoading ? (
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = selected?.code === option.code
                                    return (
                                        <CommandItem
                                            key={option.code}
                                            value={option.code}
                                            onMouseDown={(event) => {
                                                event.preventDefault()
                                                event.stopPropagation()
                                            }}
                                            onSelect={() => handleSelectOption(option)}
                                            className={cn(
                                                "flex w-full items-center gap-2",
                                                !isSelected ? "pl-8" : null,
                                            )}
                                        >
                                            {isSelected ? <Check className="w-4" /> : null}
                                            {`${option.nom} (${option.code.slice(0, 2)})`}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        ) : null}
                        {!isLoading ? (
                            <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                                {emptyMessage}
                            </CommandPrimitive.Empty>
                        ) : null}
                    </CommandList>
                </div>
            </div>
        </Command>
    )
}