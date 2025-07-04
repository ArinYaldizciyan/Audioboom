"use client";
import AudiobookCard from "@/components/AudiobookCard";
import { redirect, useSearchParams } from "next/navigation";
// pages/index.tsx
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandSeparator,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { CommandIcon, Search } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useDebounce } from "@/lib/tools/Debounce";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useSwr from "swr";
import useSWRMutation from "swr/mutation";
import { Skeleton } from "@/components/ui/skeleton";
import { FaPeopleGroup } from "react-icons/fa6";
import { parse } from "path";

interface BookInfo {
  title: string;
  cover_edition_key?: string;
  author?: string;
}

export interface BookSearchDetails {
  search: string;
  cover_edition_key?: string;
}

interface BookSearchCardProps {
  handleSearch: (details: BookSearchDetails) => void;
}

interface OpenLibraryDoc {
  title: string;
  author_key: string[];
  author_name: string[];
  cover_edition_key: string;
  cover_i: number;
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryDoc[];
  documentation_url: string;
  numFound: number;
  numFoundExact: boolean;
  num_found: number;
  offset: number;
  q: string;
  start: number;
}

//TODO: Add abort controller to the fetch request, so new autocompletes cancel previous ones
export default function BookSearchCard({ handleSearch }: BookSearchCardProps) {
  const searchParams = useSearchParams();
  const [autocomplete, setAutocomplete] = useState<BookInfo[]>([]);
  const [error, setError] = useState("");
  const search = searchParams.get("q") || "";
  const [value, setValue] = useState(search);
  const controllerRef = useRef<AbortController | null>(null);

  const parseAutocomplete = (json: OpenLibrarySearchResponse) => {
    return json.docs.map((item: OpenLibraryDoc) => ({
      title: item.title,
      author: item.author_name[0],
      cover_edition_key: item.cover_edition_key,
    }));
  };

  const handleAutocomplete = async (searchValue: string) => {
    setError("");
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const signal = controllerRef.current.signal;
      const resp = await fetch(
        `https://openlibrary.org/search.json?limit=10&q=${encodeURIComponent(
          searchValue
        )}`,
        { signal }
      );
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || "Autocomplete failed");
      }

      // 2. Parse JSON response
      const data = await resp.json();
      const bookInfo = parseAutocomplete(data);
      setAutocomplete(bookInfo);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "AbortError") {
        return;
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
    }
  };

  const debouncedAutocomplete = useDebounce(handleAutocomplete, 200);

  return (
    <Command
      className="rounded-lg border shadow-md text-base mb-4"
      shouldFilter={false}
    >
      <CommandInput
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue);
          debouncedAutocomplete(newValue);
        }}
        placeholder="Search thousands of books..."
      />
      <CommandList>
        {autocomplete.length != 0 && (
          <CommandItem
            value={value}
            onSelect={(val) => {
              setValue(val);
              setAutocomplete([]);
              handleSearch({ search: val });
            }}
          >
            {value}
          </CommandItem>
        )}
        {value &&
          autocomplete.map((book, idx) => {
            return (
              <CommandItem
                value={`${book.title.trim()} ${book.author?.trim()}`}
                key={`${idx}-${book.cover_edition_key}-${book.title}-${book.author}`}
                onSelect={(val: string) => {
                  setValue(val);
                  setAutocomplete([]);
                  handleSearch({
                    search: val,
                    cover_edition_key: book.cover_edition_key,
                  });
                }}
              >
                <span className="truncate">{book.title}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {book.author}
                </span>
              </CommandItem>
            );
          })}
      </CommandList>
    </Command>
  );
}
