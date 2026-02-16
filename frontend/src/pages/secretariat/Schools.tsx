import { ActionIcon, Button, Group, Modal, Table, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { api } from '../../api/client';
import { notifications } from '@mantine/notifications';

interface Escola {
    id: number;
    nome: string;
    inep: string | null;
    endereco: string | null;
}

export default function Schools() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            nome: '',
            inep: '',
            endereco: ''
        },
        validate: {
            nome: (value) => (value.length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : null),
        },
    });

    const { data: escolas, isLoading } = useQuery({
        queryKey: ['escolas'],
        queryFn: async () => (await api.get<Escola[]>('/pedagogical/escolas')).data
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            if (editingEscola) {
                return api.put(`/pedagogical/escolas/${editingEscola.id}`, values);
            } else {
                return api.post('/pedagogical/escolas', values);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escolas'] });
            close();
            form.reset();
            setEditingEscola(null);
            notifications.show({ title: 'Sucesso', message: 'Escola salva com sucesso!', color: 'green' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/pedagogical/escolas/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escolas'] });
            notifications.show({ title: 'Sucesso', message: 'Escola excluída!', color: 'green' });
        }
    });

    const handleEdit = (escola: Escola) => {
        setEditingEscola(escola);
        form.setValues({
            nome: escola.nome,
            inep: escola.inep || '',
            endereco: escola.endereco || ''
        });
        open();
    };

    const handleCreate = () => {
        setEditingEscola(null);
        form.reset();
        open();
    };

    return (
        <>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Gestão de Escolas</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>Nova Escola</Button>
            </Group>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Nome</Table.Th>
                        <Table.Th>INEP</Table.Th>
                        <Table.Th>Endereço</Table.Th>
                        <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {escolas?.map((escola) => (
                        <Table.Tr key={escola.id}>
                            <Table.Td>{escola.id}</Table.Td>
                            <Table.Td>{escola.nome}</Table.Td>
                            <Table.Td>{escola.inep}</Table.Td>
                            <Table.Td>{escola.endereco}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(escola)}>
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                    <ActionIcon variant="subtle" color="red" onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(escola.id) }}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title={editingEscola ? "Editar Escola" : "Nova Escola"}>
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <TextInput label="Nome" placeholder="Nome da Escola" withAsterisk mb="md" {...form.getInputProps('nome')} />
                    <TextInput label="INEP" placeholder="Código INEP" mb="md" {...form.getInputProps('inep')} />
                    <TextInput label="Endereço" placeholder="Endereço completo" mb="lg" {...form.getInputProps('endereco')} />
                    <Button fullWidth type="submit" loading={mutation.isPending}>Salvar</Button>
                </form>
            </Modal>
        </>
    );
}

import { useState } from 'react';
