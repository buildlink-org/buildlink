
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import SearchResults from './SearchResults';

interface EnhancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedSearchDialog = ({ isOpen, onClose }: EnhancedSearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setHasSearched(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        description="Search for posts, people, and companies in Kenya's construction industry">
        <DialogHeader>
          <DialogTitle>Search BuildLink Kenya</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for posts, people, companies..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {hasSearched && query.trim() ? (
            <SearchResults query={query} onClose={handleClose} />
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Start Searching</h3>
              <p className="text-gray-500">
                Find posts, people, and companies in Kenya's construction industry
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSearchDialog;
