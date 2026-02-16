import { ActionIcon, Table, Title, Tooltip } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { IconFileTypePdf } from '@tabler/icons-react';

interface Student {
    id: number; // ID da Matricula
    aluno_id: number;
    nome: string;
}

// NOTE: Estamos pegando alunos de uma turma específica? 
// A API original /people/students retorna TODOS os alunos da escola?
// Vamos assumir que sim por enquanto.

export default function StudentsList() {
    const { data: students, isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => (await api.get<Student[]>('/people/alunos')).data
    });

    const handlePrintBoletim = (studentId: number) => {
        // studentId aqui deve ser o ID do Aluno na tabela Pessoa/Aluno, 
        // mas o endpoint de boletim espera ID do ALUNO
        // A API /people/students retorna {id: aluno.id, nome: ...}
        const url = `http://localhost:8000/api/reports/boletim/${studentId}`;
        window.open(url, '_blank');
    };

    if (isLoading) return <div>Carregando...</div>;

    return (
        <>
            <Title order={2} mb="lg">Lista de Alunos (Geral)</Title>
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Nome</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {students?.map((student) => (
                        <Table.Tr key={student.id}>
                            <Table.Td>{student.id}</Table.Td>
                            <Table.Td>{student.nome}</Table.Td>
                            <Table.Td>
                                <Tooltip label="Imprimir Boletim">
                                    <ActionIcon variant="light" color="red" onClick={() => handlePrintBoletim(student.id)}>
                                        <IconFileTypePdf size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    );
}
