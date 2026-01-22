import {
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
    Command,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { useState, useRef, useCallback, type ChangeEvent } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { Check, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BaseCommune } from "@/models/commune"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"


type AutoCompleteProps = {
    options: BaseCommune[]
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

    const handleOnChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {

            // Keep the options displayed when the user is typing
            if (!isOpen) {
                setOpen(true)
            }

            setInputValue(event.target.value)
        },
        [isOpen],
    )

    const handleBlur = useCallback(() => {
        setOpen(false)
        if (selected) {
            setInputValue(selected.libelle)
        }

    }, [selected])

    const handleSelectOption = useCallback(
        (selectedOption: BaseCommune) => {
            setInputValue(selectedOption.libelle)

            setSelected(selectedOption)
            onValueChange?.(selectedOption)

            setTimeout(() => {
                inputRef?.current?.blur()
            }, 0)

            setOpen(false)
        },
        [onValueChange],
    )

    return (
        <Command shouldFilter={false} className="w-1/2">
            <CommandInput
                className="text-lg"
                asChild
            >
                <InputGroup
                    className="bg-card rounded-xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" >
                    <InputGroupInput
                        onBlur={handleBlur}
                        disabled={disabled}
                        onFocus={() => setOpen(true)}
                        ref={inputRef}
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleOnChange} />
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                </InputGroup>
            </CommandInput>
            <div className="relative mt-1">
                <div
                    className={cn(
                        "search-options animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none",
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
                                    const isSelected = selected?.code_commune === option.code_commune
                                    return (
                                        <CommandItem
                                            key={option.code_commune}
                                            value={option.code_commune}
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
                                            {`${option.libelle} (${option.code_commune.slice(0, 2)})`}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        ) : null}
                        {!isLoading ? (
                            <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-lg">
                                {emptyMessage}
                            </CommandPrimitive.Empty>
                        ) : null}
                    </CommandList>
                </div>
            </div>
        </Command>
    )
}