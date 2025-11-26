import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  unitPrice?: number;
  kgPrice?: number;
  category: string;
  description: string;
}

interface SaleItem {
  id: string;
  product: Product;
  quantity: number;
  weight?: number;
  subtotal: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  fee: number;
}

export default function VenderPage() {
  // Estados principais conforme fluxo BPMN
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Função utilitária para tratar erros
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Erro desconhecido';
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar produtos da API existente
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }

      // Carregar métodos de pagamento da API existente
      const paymentsResponse = await fetch('/api/payment');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPaymentMethods(paymentsData);
      } else {
        // Fallback para métodos padrão conforme especificação
        setPaymentMethods([
          { id: '1', name: 'Dinheiro', fee: 0 },
          { id: '2', name: 'Pix', fee: 0 },
          { id: '3', name: 'Cartão', fee: 1.99 }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Selecionar produtos (conforme fluxo BPMN)
  const addProductToSale = (product: Product) => {
    const existingItem = saleItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Se já existe, incrementa quantidade
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      // Adiciona novo item
      const newItem: SaleItem = {
        id: Date.now().toString(),
        product,
        quantity: 1,
        weight: product.kgPrice ? 1 : undefined,
        subtotal: product.unitPrice || (product.kgPrice || 0) * 1
      };
      setSaleItems([...saleItems, newItem]);
    }
  };

  // 2. Definir quantidades (conforme fluxo BPMN)
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const subtotal = item.product.unitPrice 
          ? item.product.unitPrice * newQuantity
          : (item.product.kgPrice || 0) * newQuantity;
        
        return {
          ...item,
          quantity: newQuantity,
          subtotal
        };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  // Cálculos conforme especificação
  const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedPayment = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
  const taxAmount = selectedPayment ? (subtotal * selectedPayment.fee) / 100 : 0;
  const discount = 0; // Implementar se necessário
  const total = subtotal + taxAmount - discount;
  const change = parseFloat(receivedAmount) - total;

  // 3-4. Escolher pagamento e calcular taxa/total (conforme fluxo BPMN)
  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  // 5-6. Confirmar venda e registrar (conforme fluxo BPMN)
  const processSale = async () => {
    if (!selectedPaymentMethod || saleItems.length === 0) {
      alert('Adicione produtos e selecione a forma de pagamento');
      return;
    }

    if (parseFloat(receivedAmount) < total) {
      alert('Valor recebido é insuficiente');
      return;
    }

    setIsProcessingSale(true);

    try {
      // 6. Registrar em Sales/SaleItems conforme arquitetura
      const saleData = {
        items: saleItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          weight: item.weight,
          unitPrice: item.product.unitPrice,
          kgPrice: item.product.kgPrice,
          subtotal: item.subtotal
        })),
        paymentMethodId: selectedPaymentMethod,
        subtotal,
        taxAmount,
        discount,
        total,
        receivedAmount: parseFloat(receivedAmount),
        change
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        // Limpar formulário após sucesso
        setSaleItems([]);
        setSelectedPaymentMethod('');
        setReceivedAmount('');
        alert('Venda realizada com sucesso!');
      } else {
        throw new Error('Erro ao processar venda');
      }
    } catch (error) {
      console.error('Erro ao processar venda:', getErrorMessage(error));
      alert('Erro ao processar venda: ' + getErrorMessage(error));
    } finally {
      setIsProcessingSale(false);
    }
  };

  const cancelSale = () => {
    setSaleItems([]);
    setSelectedPaymentMethod('');
    setReceivedAmount('');
  };

  // Filtrar produtos para pesquisa
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      margin: 0, 
      padding: 0, 
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header EXATO como na Foto 3 */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e9ecef',
        padding: '12px 32px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#212529', margin: 0 }}>Fast caixa</h1>
          </div>
          
          <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Página inicial
            </Link>
            <Link href="/vender" style={{ 
              textDecoration: 'none', 
              color: '#007bff', 
              fontWeight: 500, 
              fontSize: '14px'
            }}>
              Vender
            </Link>
            <Link href="/produtos" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Produtos
            </Link>
            <Link href="/cadastro" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Cadastro
            </Link>
            <Link href="/estatisticas" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Estatísticas
            </Link>
            <Link href="/configuracoes" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Configurações
            </Link>
            <Link href="/ajuda" style={{ 
              textDecoration: 'none', 
              color: '#6c757d', 
              fontWeight: 400, 
              fontSize: '14px'
            }}>
              Ajuda
            </Link>
          </nav>
        </div>
      </header>

      {/* Container Nova venda EXATO como na Foto 3 */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 32px' }}>
        <div style={{
          background: '#007bff',
          color: 'white',
          padding: '20px 32px',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center' as const
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0 }}>Nova venda</h1>
        </div>

        {/* Layout em duas colunas como na Foto 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Coluna esquerda: Busca e produtos */}
          <div>
            {/* Campo de busca com botão + */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produto..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #ced4da',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <button
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    width: '48px'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Lista de produtos filtrados */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '300px',
              overflowY: 'auto' as const
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#495057' }}>
                Produtos disponíveis
              </h3>
              {filteredProducts.length === 0 ? (
                <p style={{ color: '#6c757d', textAlign: 'center' as const }}>
                  Nenhum produto encontrado
                </p>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => addProductToSale(product)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '8px',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{product.name}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>{product.category}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#007bff' }}>
                      {product.unitPrice ? `R$ ${product.unitPrice.toFixed(2)}` : 
                       product.kgPrice ? `R$ ${product.kgPrice.toFixed(2)}/kg` : 'S/ preço'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coluna direita: Carrinho e pagamento */}
          <div>
            {/* Tabela de itens EXATA como na Foto 3 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#495057' }}>
                Itens da venda
              </h3>
              
              {saleItems.length === 0 ? (
                <p style={{ color: '#6c757d', textAlign: 'center' as const, padding: '20px' }}>
                  Nenhum item adicionado
                </p>
              ) : (
                <div style={{ overflowX: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                        <th style={{ textAlign: 'left' as const, padding: '8px', fontSize: '12px', color: '#6c757d' }}>Produto</th>
                        <th style={{ textAlign: 'center' as const, padding: '8px', fontSize: '12px', color: '#6c757d' }}>Qtd</th>
                        <th style={{ textAlign: 'right' as const, padding: '8px', fontSize: '12px', color: '#6c757d' }}>Subtotal</th>
                        <th style={{ textAlign: 'center' as const, padding: '8px', fontSize: '12px', color: '#6c757d' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.product.name}</div>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                              {item.product.unitPrice ? 
                                `R$ ${item.product.unitPrice.toFixed(2)} un` : 
                                `R$ ${(item.product.kgPrice || 0).toFixed(2)} kg`
                              }
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' as const, padding: '12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '24px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: '14px', fontWeight: 500, minWidth: '20px', textAlign: 'center' as const }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '24px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' as const, padding: '12px 8px', fontWeight: 500 }}>
                            R$ {item.subtotal.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'center' as const, padding: '12px 8px' }}>
                            <button
                              onClick={() => removeItem(item.id)}
                              style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Cálculos EXATOS como na Foto 3 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>Subtotal:</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>Taxa:</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>R$ {taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6c757d' }}>Desconto:</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>R$ {discount.toFixed(2)}</span>
              </div>
              <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e9ecef' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Total:</span>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#007bff' }}>R$ {total.toFixed(2)}</span>
              </div>

              {/* Valor recebido e troco */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  Valor recebido:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #ced4da',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {receivedAmount && parseFloat(receivedAmount) >= total && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#6c757d' }}>Troco:</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#28a745' }}>
                    R$ {change.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Formas de pagamento EXATAS como na Foto 3 */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#495057' }}>
                Forma de pagamento
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodChange(method.id)}
                    style={{
                      padding: '12px 20px',
                      border: selectedPaymentMethod === method.id ? '2px solid #007bff' : '1px solid #ced4da',
                      borderRadius: '8px',
                      background: selectedPaymentMethod === method.id ? '#e7f3ff' : 'white',
                      color: selectedPaymentMethod === method.id ? '#007bff' : '#495057',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    {method.name === 'Dinheiro' ? '💵' : 
                     method.name === 'Pix' ? '📱' : '💳'} {method.name}
                    {method.fee > 0 && (
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        +{method.fee}%
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões finais EXATOS como na Foto 3 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={processSale}
                disabled={isProcessingSale || saleItems.length === 0 || !selectedPaymentMethod}
                style={{
                  flex: 1,
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '16px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: (isProcessingSale || saleItems.length === 0 || !selectedPaymentMethod) ? 'not-allowed' : 'pointer',
                  opacity: (isProcessingSale || saleItems.length === 0 || !selectedPaymentMethod) ? 0.6 : 1
                }}
              >
                {isProcessingSale ? 'Processando...' : 'Fechar venda'}
              </button>
              
              <button
                onClick={cancelSale}
                style={{
                  flex: 1,
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '16px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center' as const,
        padding: '20px',
        color: '#6c757d',
        fontSize: '12px',
        borderTop: '1px solid #e9ecef',
        marginTop: '40px'
      }}>
        © 2023 Fast caixa. All rights reserved.
      </footer>
    </div>
  );
}