'use client';

import React, { useState, useMemo } from 'react';
import { StyledComponentsProvider } from '@interview/ui';
import styled from 'styled-components';

// 类型定义
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator';
  status: 'Active' | 'Inactive' | 'Pending';
  department: string;
  createdAt: string;
  lastLogin: string;
}

// 样式组件
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[500]}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.disabled};
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const TableHeader = styled.thead`
  background: ${props => props.theme.colors.gray[50]};
  border-bottom: 2px solid ${props => props.theme.colors.gray[200]};
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background: ${props => props.theme.colors.gray[50]};
  }
  
  tr:hover {
    background: ${props => props.theme.colors.primary[50]};
  }
`;

const Th = styled.th`
  text-align: left;
  padding: ${props => props.theme.spacing.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }
  
  .sort-icon {
    margin-left: ${props => props.theme.spacing.xs};
    opacity: 0.6;
  }
`;

const Td = styled.td`
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  color: ${props => props.theme.colors.text.secondary};
`;

const StatusBadge = styled.span<{ status: User['status'] }>`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.status) {
      case 'Active': return props.theme.colors.success + '20';
      case 'Inactive': return props.theme.colors.gray[200];
      case 'Pending': return props.theme.colors.warning + '20';
      default: return props.theme.colors.gray[200];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Active': return props.theme.colors.success;
      case 'Inactive': return props.theme.colors.text.secondary;
      case 'Pending': return props.theme.colors.warning;
      default: return props.theme.colors.text.secondary;
    }
  }};
`;

const RoleBadge = styled.span<{ role: User['role'] }>`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.role) {
      case 'Admin': return props.theme.colors.primary[100];
      case 'Moderator': return props.theme.colors.info + '20';
      case 'User': return props.theme.colors.gray[100];
      default: return props.theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'Admin': return props.theme.colors.primary[700];
      case 'Moderator': return props.theme.colors.info;
      case 'User': return props.theme.colors.text.primary;
      default: return props.theme.colors.text.primary;
    }
  }};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  background: ${props => props.theme.colors.gray[50]};
`;

const Button = styled.button<{ disabled?: boolean }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.disabled ? props.theme.colors.gray[100] : 'white'};
  color: ${props => props.disabled ? props.theme.colors.text.disabled : props.theme.colors.text.primary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.gray[100]};
    border-color: ${props => props.theme.colors.gray[400]};
  }
`;

const PageInfo = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// 测试数据
const initialUsers: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'Admin',
    status: 'Active',
    department: '技术部',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-15 10:30:00'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: 'User',
    status: 'Active',
    department: '市场部',
    createdAt: '2024-02-20',
    lastLogin: '2024-12-14 16:45:00'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: 'Moderator',
    status: 'Pending',
    department: '人事部',
    createdAt: '2024-03-10',
    lastLogin: '2024-12-13 09:20:00'
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: 'User',
    status: 'Inactive',
    department: '财务部',
    createdAt: '2024-04-05',
    lastLogin: '2024-11-30 14:15:00'
  },
  {
    id: 5,
    name: '孙七',
    email: 'sunqi@example.com',
    role: 'Admin',
    status: 'Active',
    department: '技术部',
    createdAt: '2024-05-12',
    lastLogin: '2024-12-15 08:45:00'
  },
  {
    id: 6,
    name: '周八',
    email: 'zhouba@example.com',
    role: 'User',
    status: 'Active',
    department: '销售部',
    createdAt: '2024-06-18',
    lastLogin: '2024-12-14 18:30:00'
  },
  {
    id: 7,
    name: '吴九',
    email: 'wujiu@example.com',
    role: 'Moderator',
    status: 'Active',
    department: '客服部',
    createdAt: '2024-07-22',
    lastLogin: '2024-12-13 11:10:00'
  },
  {
    id: 8,
    name: '郑十',
    email: 'zhengshi@example.com',
    role: 'User',
    status: 'Pending',
    department: '产品部',
    createdAt: '2024-08-08',
    lastLogin: '2024-12-12 15:25:00'
  },
  {
    id: 9,
    name: '钱十一',
    email: 'qianshiyi@example.com',
    role: 'Admin',
    status: 'Inactive',
    department: '技术部',
    createdAt: '2024-09-14',
    lastLogin: '2024-11-25 13:40:00'
  },
  {
    id: 10,
    name: '陈十二',
    email: 'chenshier@example.com',
    role: 'User',
    status: 'Active',
    department: '市场部',
    createdAt: '2024-10-28',
    lastLogin: '2024-12-15 09:15:00'
  },
  {
    id: 11,
    name: '林十三',
    email: 'linshisan@example.com',
    role: 'Moderator',
    status: 'Active',
    department: '人事部',
    createdAt: '2024-11-03',
    lastLogin: '2024-12-14 17:50:00'
  },
  {
    id: 12,
    name: '刘十四',
    email: 'liushisi@example.com',
    role: 'User',
    status: 'Active',
    department: '财务部',
    createdAt: '2024-12-01',
    lastLogin: '2024-12-13 10:05:00'
  }
];

// 表格组件
const DataTable: React.FC = () => {
  const [users] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // 排序处理
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // 排序图标
  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortField !== field) {
      return <span className="sort-icon">↕️</span>;
    }
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // 过滤和排序
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortField, sortDirection]);

  // 分页
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Container>
      <Header>
        <Title>用户管理表格</Title>
        <div style={{ width: '300px' }}>
          <SearchInput
            type="text"
            placeholder="搜索用户、邮箱、部门或角色..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Header>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <Th onClick={() => handleSort('id')}>
                ID <SortIcon field="id" />
              </Th>
              <Th onClick={() => handleSort('name')}>
                姓名 <SortIcon field="name" />
              </Th>
              <Th onClick={() => handleSort('email')}>
                邮箱 <SortIcon field="email" />
              </Th>
              <Th onClick={() => handleSort('role')}>
                角色 <SortIcon field="role" />
              </Th>
              <Th onClick={() => handleSort('status')}>
                状态 <SortIcon field="status" />
              </Th>
              <Th onClick={() => handleSort('department')}>
                部门 <SortIcon field="department" />
              </Th>
              <Th onClick={() => handleSort('createdAt')}>
                创建时间 <SortIcon field="createdAt" />
              </Th>
              <Th onClick={() => handleSort('lastLogin')}>
                最后登录 <SortIcon field="lastLogin" />
              </Th>
            </tr>
          </TableHeader>
          <TableBody>
            {currentPageUsers.map(user => (
              <tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td><RoleBadge role={user.role}>{user.role}</RoleBadge></Td>
                <Td><StatusBadge status={user.status}>{user.status}</StatusBadge></Td>
                <Td>{user.department}</Td>
                <Td>{user.createdAt}</Td>
                <Td>{user.lastLogin}</Td>
              </tr>
            ))}
            {currentPageUsers.length === 0 && (
              <tr>
                <Td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  没有找到匹配的用户
                </Td>
              </tr>
            )}
          </TableBody>
        </Table>

        <PaginationContainer>
          <PageInfo>
            显示 {startIndex + 1} - {Math.min(endIndex, filteredAndSortedUsers.length)} 条，共 {filteredAndSortedUsers.length} 条
          </PageInfo>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
              上一页
            </Button>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
              下一页
            </Button>
          </div>
        </PaginationContainer>
      </TableContainer>
    </Container>
  );
};

// 页面组件
const TablePage: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <DataTable />
    </StyledComponentsProvider>
  );
};

export default TablePage;