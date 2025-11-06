import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return <Button>Button</Button>
}

export default App
