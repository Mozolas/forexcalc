import React, { useState, useRef, useEffect, useId } from 'react';
import styled from 'styled-components';
import { ExchangeRate } from '../services/cnbClient';

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.$isOpen ? 'var(--color-accent)' : 'var(--color-border)'};
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text);
  height: 48px;
  box-sizing: border-box;

  &:hover {
    border-color: var(--color-accent);
  }

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  outline: none;
  background: var(--color-surface);
  color: var(--color-text);
  box-sizing: border-box;

  &:focus {
    border-bottom-color: var(--color-accent);
  }
`;

const DropdownItem = styled.div<{ $isSelected: boolean }>`
  padding: 0.75rem;
  cursor: pointer;
  background: ${props => props.$isSelected ? 'var(--color-bg)' : 'transparent'};
  border-left: 3px solid ${props => props.$isSelected ? 'var(--color-accent)' : 'transparent'};

  &:hover {
    background: var(--color-bg);
  }
`;

const ItemText = styled.div`
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
`;

const ItemCode = styled.div`
  font-size: 0.75rem;
  color: var(--color-secondary);
`;

const Placeholder = styled.span`
  color: var(--color-secondary);
`;

interface SearchableDropdownProps {
  options: ExchangeRate[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select currency...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const inputId = useId();

  const selectedOption = options.find(opt => opt.code === value);

  const filteredOptions = options.filter(option =>
    option.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      searchInputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <DropdownContainer ref={containerRef}>
      <DropdownButton
        type="button"
        $isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={inputId}
      >
        {selectedOption ? (
          <span id={inputId}>{selectedOption.code}</span>
        ) : (
          <Placeholder id={inputId}>{placeholder}</Placeholder>
        )}
        <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </DropdownButton>
      {isOpen && (
        <DropdownList role="listbox" id={listboxId} aria-label="Currency selection">
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="Search currency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchTerm('');
              }
            }}
            aria-label="Search currencies"
          />
          {filteredOptions.length === 0 ? (
            <DropdownItem $isSelected={false} role="option" aria-selected={false}>
              <ItemText>No currencies found</ItemText>
            </DropdownItem>
          ) : (
            filteredOptions.map((option) => (
              <DropdownItem
                key={option.code}
                $isSelected={option.code === value}
                onClick={() => handleSelect(option.code)}
                role="option"
                aria-selected={option.code === value}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option.code);
                  }
                }}
              >
                <ItemText>{option.code}</ItemText>
                <ItemCode>{option.country}</ItemCode>
              </DropdownItem>
            ))
          )}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

export default SearchableDropdown;
