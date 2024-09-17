import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import MagnifyGlass from '@/app/assets/MagnifyGlass';

interface Option {
  value: string;
  label: string | React.ReactNode;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder: string;
  onValueChange: (value: string) => void;
  searchTerm: string;
}

export function SearchableSelect({ options, placeholder, onValueChange, searchTerm }: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [, setSelectedOption] = useState<Option | null>(null);

  const filteredOptions = options.filter(option =>
    typeof option.label === 'string'
      ? option.label.toLowerCase().includes(search.toLowerCase())
      : option.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onValueChange(option.value);
    setSearch(typeof option.label === 'string' ? option.label : option.value);
    setIsOpen(false);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if(!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <>

    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-between w-full border rounded-md bg-white cursor-pointer overflow-hidden">
          <MagnifyGlass className="w-6 h-6 ml-3" />
          <div className="flex-1">
            <Input
              value={search}
              placeholder={placeholder}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 mr-2" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[238px] p-0 mt-1" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center p-2.5 cursor-pointer hover:bg-gray-100 rounded text-sm"
              onClick={() => handleSelect(option)}
            >
              {typeof option.label === 'string' ? (
                <HighlightedText text={option.label} highlight={searchTerm} />
              ) : (
                option.label
              )}
            </div>
          )) : (
            <div className="flex items-center p-2.5 cursor-pointer hover:bg-gray-100 rounded text-sm">
              No results found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
    </>
  );
}

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
      )}
    </span>
  );
};