import { useState, useEffect, FormEvent } from 'react';

interface Item {
  id: number;
  title: string;
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/items');

        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.statusText}`);
        }

        const data: Item[] = await response.json();
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create item: ${response.statusText}`);
      }

      const newItem: Item = await response.json();

      setItems((prevItems) => [...prevItems, newItem]);

      setTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h1>My Items</h1>

      <section>
        <h2>Add a New Item</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <label htmlFor="title" style={{ alignSelf: 'center' }}>
            Title:
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ flexGrow: 1, padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 12px' }}>
            Add
          </button>
        </form>
      </section>

      <hr style={{ margin: '30px 0' }} />

      <section>
        <h2>Existing Items</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  marginBottom: '5px',
                  borderRadius: '4px',
                }}
              >
                {item.title} (ID: {item.id})
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
