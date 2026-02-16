import { ActionIcon, Button, Group, Modal, Select, Table, TextInput, Title, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { api } from '../../api/client';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface Escola {
    id: number;
    nome: string;
}

interface AnoLetivo {
    id: number;
    escola_id: number;
    ano: number;
    data_inicio: string;
    data_fim: string;
    ativo: boolean;
}

export default function AcademicYears() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingAno, setEditingAno] = useState<AnoLetivo | null>(null);
    const [selectedEscolaId, setSelectedEscolaId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            escola_id: '',
            ano: new Date().getFullYear(),
            data_inicio: '',
            data_fim: '',
            ativo: true
        },
    });

    // Fetch Escolas for Select
    const { data: escolas } = useQuery({
        queryKey: ['escolas'],
        queryFn: async () => (await api.get<Escola[]>('/pedagogical/escolas')).data
    });

    // Fetch Anos for selected Escola
    const { data: anos } = useQuery({
        queryKey: ['anos-letivos', selectedEscolaId],
        queryFn: async () => (await api.get<AnoLetivo[]>(`/pedagogical/escolas/${selectedEscolaId}/anos-letivos`)).data,
        enabled: !!selectedEscolaId
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            const payload = { ...values, escola_id: Number(values.escola_id) };
            if (editingAno) {
                return api.put(`/pedagogical/anos-letivos/${editingAno.id}`, payload);
            } else {
                return api.post('/pedagogical/anos-letivos', payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anos-letivos'] });
            close();
            form.reset();
            setEditingAno(null);
            notifications.show({ title: 'Sucesso', message: 'Ano Letivo salvo!', color: 'green' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/pedagogical/anos-letivos/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anos-letivos'] });
            notifications.show({ title: 'Sucesso', message: 'Ano Letivo excluído!', color: 'green' });
        }
    });

    const handleEdit = (ano: AnoLetivo) => {
        setEditingAno(ano);
        form.setValues({
            escola_id: String(ano.escola_id),
            ano: ano.ano,
            data_inicio: ano.data_inicio,
            data_fim: ano.data_fim,
            ativo: ano.ativo
        });
        open();
    };

    const handleCreate = () => {
        setEditingAno(null);
        form.setFieldValue('escola_id', selectedEscolaId || '');
        open();
    };

    return (
        <>
            <Title order={2} mb="lg">Gestão de Anos Letivos</Title>

            <Select
                label="Selecione a Escola"
                placeholder="Escolha uma escola"
                data={escolas?.map(e => ({ value: String(e.id), label: e.nome })) || []}
                value={selectedEscolaId}
                onChange={setSelectedEscolaId}
                mb="lg"
                w={400}
            />

            {selectedEscolaId && (
                <>
                    <Group justify="flex-end" mb="md">
                        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>Novo Ano Letivo</Button>
                    </Group>

                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Ano</Table.Th>
                                <Table.Th>Início</Table.Th>
                                <Table.Th>Fim</Table.Th>
                                <Table.Th>Ativo</Table.Th>
                                <Table.Th>Ações</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {anos?.map((ano) => (
                                <Table.Tr key={ano.id}>
                                    <Table.Td>{ano.ano}</Table.Td>
                                    <Table.Td>{ano.data_inicio}</Table.Td>
                                    <Table.Td>{ano.data_fim}</Table.Td>
                                    <Table.Td>{ano.ativo ? 'Sim' : 'Não'}</Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(ano)}>
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(ano.id) }}>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </>
            )}

            <Modal opened={opened} onClose={close} title={editingAno ? "Editar Ano Letivo" : "Novo Ano Letivo"}>
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <Select
                        label="Escola"
                        data={escolas?.map(e => ({ value: String(e.id), label: e.nome })) || []}
                        mb="md"
                        {...form.getInputProps('escola_id')}
                        disabled
                    />
                    <TextInput type="number" label="Ano" mb="md" {...form.getInputProps('ano')} />
                    <TextInput type="date" label="Data Início" mb="md" {...form.getInputProps('data_inicio')} />
                    <TextInput type="date" label="Data Fim" mb="md" {...form.getInputProps('data_fim')} />
                    <Checkbox label="Ativo" mb="lg" {...form.getInputProps('ativo', { type: 'checkbox' })} />

                    <Button fullWidth type="submit" loading={mutation.isPending}>Salvar</Button>
                </form>
            </Modal>
        </>
    );
}
