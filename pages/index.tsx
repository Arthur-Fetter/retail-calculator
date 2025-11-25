import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
}

interface Sale {
  id: number;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  createdAt: string;
  paymentMethod: {
    name: string;
  };
  items: {
    product: {
      name: string;
    };
    quantity: number;
    subtotal: number;
  }[];
}

interface PaymentMethod {
  id: number;
  name: string;
  taxRate: number;
}

export default function HomePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    lucroTotal: 0,
    produtoMaisVendido: '',
    metodoPagamentoMaisUsado: '',
    tempoMedioPorTransacao: '0 min 0 seg'
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const salesResponse = await fetch('/api/sales');
      const salesData: Sale[] = salesResponse.ok ? await salesResponse.json() : [];
      setSales(salesData);

      const productsResponse = await fetch('/api/products');
      const productsData: Product[] = productsResponse.ok ? await productsResponse.json() : [];
      setProducts(productsData);

      const paymentsResponse = await fetch('/api/payments');
      const paymentsData: PaymentMethod[] = paymentsResponse.ok ? await paymentsResponse.json() : [];
      setPaymentMethods(paymentsData);

      if (salesData.length > 0) {
        const lucroTotal = salesData.reduce((acc, sale) => acc + sale.totalNet, 0);
        
        const produtoVendas: { [key: string]: number } = {};
        salesData.forEach(sale => {
          sale.items.forEach(item => {
            produtoVendas[item.product.name] = (produtoVendas[item.product.name] || 0) + item.quantity;
          });
        });
        const produtoMaisVendido = Object.keys(produtoVendas).reduce((a, b) => 
          produtoVendas[a] > produtoVendas[b] ? a : b, ''
        );

        const metodoPagamentos: { [key: string]: number } = {};
        salesData.forEach(sale => {
          metodoPagamentos[sale.paymentMethod.name] = (metodoPagamentos[sale.paymentMethod.name] || 0) + 1;
        });
        const metodoPagamentoMaisUsado = Object.keys(metodoPagamentos).reduce((a, b) => 
          metodoPagamentos[a] > metodoPagamentos[b] ? a : b, ''
        );

        setMetrics({
          lucroTotal,
          produtoMaisVendido,
          metodoPagamentoMaisUsado,
          tempoMedioPorTransacao: '1 min 30 seg'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0, background: '#f8f9fa' }}>
      {/* Header EXATO como Fast caixa */}
      <header style={{
        background: 'white',
        borderBottom: '2px solid #e9ecef',
        padding: '20px 40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '28px' }}>🛒</span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#212529', margin: 0 }}>Feirinha</h1>
          </div>
          
          <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ 
              textDecoration: 'none', 
              color: '#007bff', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid #007bff'
            }}>
              Página inicial
            </Link>
            <Link href="/vender" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Vender
            </Link>
            <Link href="/produtos" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Produtos
            </Link>
            <Link href="/estatisticas" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Estatísticas
            </Link>
            <Link href="/configuracoes" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Configurações
            </Link>
            <Link href="/ajuda" style={{ 
              textDecoration: 'none', 
              color: '#495057', 
              fontWeight: 500, 
              fontSize: '16px', 
              padding: '12px 0',
              borderBottom: '3px solid transparent'
            }}>
              Ajuda
            </Link>
          </nav>

          <div style={{
            width: '45px',
            height: '45px',
            background: '#007bff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '16px'
          }}>
            U
          </div>
        </div>
      </header>

      {/* Banner azul EXATO */}
      <div style={{
        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        color: 'white',
        padding: '60px 40px',
        textAlign: 'center' as const,
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '36px', 
          fontWeight: 700, 
          marginBottom: '12px', 
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          margin: '0 0 12px 0'
        }}>
          Dashboard - Feirinha
        </h2>
        <p style={{ fontSize: '18px', opacity: 0.9, fontWeight: 400, margin: 0 }}>
          Controle seu fluxo de caixa diário com facilidade
        </p>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center' as const, padding: '80px 40px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Cards de métricas EXATOS como Fast caixa */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '30px',
              marginBottom: '40px'
            }}>
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: 600,
                  marginBottom: '10px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  Lucro total
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#28a745',
                  lineHeight: 1.2
                }}>
                  {formatCurrency(metrics.lucroTotal)}
                </div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: 600,
                  marginBottom: '10px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  Produto mais vendido
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#212529',
                  lineHeight: 1.2
                }}>
                  {metrics.produtoMaisVendido || 'Nenhum produto'}
                </div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: 600,
                  marginBottom: '10px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  Método de pagamento mais usado
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#212529',
                  lineHeight: 1.2
                }}>
                  {metrics.metodoPagamentoMaisUsado || 'Nenhum método'}
                </div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: 600,
                  marginBottom: '10px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  Tempo médio por transação
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#212529',
                  lineHeight: 1.2
                }}>
                  {metrics.tempoMedioPorTransacao}
                </div>
              </div>
            </div>

            {/* Tabela vendas EXATA como Fast caixa */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              marginBottom: '30px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '25px 30px',
                borderBottom: '2px solid #f8f9fa',
                background: '#fdfdfd'
              }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#212529',
                  margin: 0
                }}>
                  Últimas {Math.min(5, sales.length)} vendas
                </h3>
              </div>
              
              {sales.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '80px 40px' }}>
                  <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.6 }}>📊</div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#212529', marginBottom: '12px' }}>
                    Nenhuma venda registrada
                  </h3>
                  <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '30px', lineHeight: 1.6 }}>
                    Comece fazendo sua primeira venda!
                  </p>
                  <Link href="/vender" style={{
                    display: 'inline-block',
                    padding: '12px 25px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    background: '#007bff',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                  }}>
                    Fazer primeira venda
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '15px' }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Data
                        </th>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Produto
                        </th>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Valor
                        </th>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Método de pagamento
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, 5).map((sale) => (
                        <tr key={sale.id}>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: '#495057',
                            fontWeight: 500
                          }}>
                            {formatDate(sale.createdAt)}
                          </td>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: '#495057',
                            fontWeight: 500
                          }}>
                            {sale.items.map(item => item.product.name).join(', ')}
                          </td>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: '#28a745',
                            fontWeight: 700
                          }}>
                            {formatCurrency(sale.totalGross)}
                          </td>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: '#495057',
                            fontWeight: 500
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: '#e9ecef',
                              color: '#495057',
                              textTransform: 'uppercase' as const,
                              letterSpacing: '0.5px'
                            }}>
                              {sale.paymentMethod.name}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Métodos de pagamento */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              marginBottom: '30px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '25px 30px',
                borderBottom: '2px solid #f8f9fa',
                background: '#fdfdfd'
              }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#212529',
                  margin: 0
                }}>
                  Métodos de Pagamento Configurados
                </h3>
              </div>
              
              {paymentMethods.length === 0 ? (
                <div style={{ textAlign: 'center' as const, padding: '80px 40px' }}>
                  <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.6 }}>💳</div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#212529', marginBottom: '12px' }}>
                    Nenhum método de pagamento configurado
                  </h3>
                  <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '30px', lineHeight: 1.6 }}>
                    Configure métodos como Pix (0%), Débito (1,99%), Crédito (4,79%)
                  </p>
                  <Link href="/configuracoes" style={{
                    display: 'inline-block',
                    padding: '12px 25px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    background: '#007bff',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                  }}>
                    Configurar Métodos de Pagamento
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' as const }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '15px' }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Método de Pagamento
                        </th>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Taxa
                        </th>
                        <th style={{
                          background: '#f8f9fa',
                          padding: '18px 25px',
                          textAlign: 'left' as const,
                          fontWeight: 700,
                          color: '#495057',
                          fontSize: '14px',
                          borderBottom: '2px solid #e9ecef',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethods.map((method) => (
                        <tr key={method.id}>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: '#495057',
                            fontWeight: 700
                          }}>
                            {method.name === 'Pix' ? '📱' : 
                             method.name === 'Dinheiro' ? '💵' :
                             method.name === 'Débito' ? '💳' :
                             method.name === 'Crédito' ? '💎' : '💰'} {method.name}
                          </td>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: method.taxRate > 0 ? '#dc3545' : '#28a745',
                            fontWeight: 700
                          }}>
                            {method.taxRate > 0 ? `${method.taxRate.toFixed(2)}%` : 'Sem taxa'}
                          </td>
                          <td style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f8f9fa',
                            color: '#495057',
                            fontWeight: 500
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: '#d1ecf1',
                              color: '#0c5460',
                              textTransform: 'uppercase' as const,
                              letterSpacing: '0.5px'
                            }}>
                              Ativo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ações rápidas */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center', 
        padding: '40px', 
        flexWrap: 'wrap' as const 
      }}>
        <Link href="/vender" style={{
          display: 'inline-block',
          padding: '12px 25px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '15px',
          background: '#007bff',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
        }}>
          💰 Nova Venda
        </Link>
        <Link href="/produtos" style={{
          display: 'inline-block',
          padding: '12px 25px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '15px',
          background: 'white',
          color: '#007bff',
          border: '2px solid #007bff'
        }}>
          🥕 Gerenciar Produtos ({products.length})
        </Link>
        <Link href="/configuracoes" style={{
          display: 'inline-block',
          padding: '12px 25px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '15px',
          background: 'white',
          color: '#007bff',
          border: '2px solid #007bff'
        }}>
          ⚙️ Configurações
        </Link>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}