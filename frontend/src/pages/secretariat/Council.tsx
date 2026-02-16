import { Select, Table, Title, Paper, Badge, Text, ScrollArea } from '@mantine/core';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

interface Turma {
    id: number;
    nome: string;
}

interface NotaDisciplina {
    disciplina: string;
    total: number;
}

interface AlunoConselho {
    aluno_nome: string;
    notas: NotaDisciplina[];
}

export default function Council() {
    const [turmaId, setTurmaId] = useState<string | null>(null);

    const { data: turmas } = useQuery({
        queryKey: ['turmas'],
        queryFn: async () => (await api.get<Turma[]>('/academic/turmas')).data
    });

    const { data: conselho, isLoading } = useQuery({
        queryKey: ['conselho', turmaId],
        queryFn: async () => {
            if (!turmaId) return [];
            return (await api.get<AlunoConselho[]>(`/academic/turmas/${turmaId}/conselho`)).data;
        },
        enabled: !!turmaId
    });

    // Extract unique disciplines from the first student (assuming all have same structure)
    const disciplinas = conselho && conselho.length > 0 ? conselho[0].notas.map(n => n.disciplina) : [];

    return (
        <>
            <Title order={2} mb="lg">Conselho de Classe</Title>

            <Select
                label="Selecione a Turma"
                placeholder="Turma"
                data={turmas?.map(t => ({ value: String(t.id), label: t.nome })) || []}
                value={turmaId}
                onChange={setTurmaId}
                mb="lg"
                maw={300}
            />

            {turmaId && conselho && (
                <ScrollArea>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Aluno</Table.Th>
                                {disciplinas.map(d => (
                                    <Table.Th key={d} style={{ textAlign: 'center' }}>{d}</Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {conselho.map((aluno, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{aluno.aluno_nome}</Table.Td>
                                    {aluno.notas.map(nota => (
                                        <Table.Td key={nota.disciplina} style={{ textAlign: 'center' }}>
                                            <Text
                                                fw={500}
                                                c={nota.total < 60 ? 'red' : 'dark'}
                                            >
                                                {nota.total.toFixed(1)}
                                            </Text>
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            )}
        </>
    );
}
