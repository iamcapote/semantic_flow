import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { CreateWorkflowInputSchema, UpdateWorkflowInputSchema } from '../schemas/workflow';
import { createClient } from '@supabase/supabase-js';

// Supabase client as fallback for direct database access
let supabase: any = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
} catch (error) {
  console.warn('Supabase client initialization failed:', error);
  supabase = null;
}

export const workflowRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      // Try Prisma first, fallback to Supabase client
      if (ctx && ctx.prisma) {
        const userId = 'user_placeholder';
        return ctx.prisma.workflow.findMany({
          where: { userId: userId },
          orderBy: { updatedAt: 'desc' },
        });
      } else if (supabase) {
        // Fallback to Supabase client if available
        const { data, error } = await supabase
          .from('Workflow')
          .select('*')
          .order('updatedAt', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } else {
        // Return empty array if no database available
        console.warn('No database connection available');
        return [];
      }
    } catch (error) {
      console.error('Error listing workflows:', error);
      return [];
    }
  }),

  create: publicProcedure
    .input(CreateWorkflowInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = 'user_placeholder';
        const { title, description, content } = input;
        
        if (ctx.prisma) {
          return ctx.prisma.workflow.create({
            data: {
              title,
              description,
              content,
              version: '1.0.0',
              userId: userId,
            },
          });
        } else if (supabase) {
          // Fallback to Supabase client
          const { data, error } = await supabase
            .from('Workflow')
            .insert({
              title,
              description,
              content,
              version: '1.0.0',
              userId: userId,
            })
            .select()
            .single();
          
          if (error) throw error;
          return data;
        }
      } catch (error) {
        console.error('Error creating workflow:', error);
        throw new Error('Failed to create workflow');
      }
    }),

  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    try {
      if (ctx.prisma) {
        return ctx.prisma.workflow.findUnique({
          where: { id: input },
        });
      } else {
        const { data, error } = await supabase
          .from('Workflow')
          .select('*')
          .eq('id', input)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }
    } catch (error) {
      console.error('Error getting workflow:', error);
      return null;
    }
  }),

  update: publicProcedure
    .input(UpdateWorkflowInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, data } = input;
        const { title, description, content, isPublic } = data;

        if (ctx.prisma) {
          return ctx.prisma.workflow.update({
            where: { id },
            data: {
              ...(title && { title }),
              ...(description !== undefined && { description }),
              ...(content && { content }),
              ...(isPublic !== undefined && { isPublic }),
            },
          });
        } else {
          const updateData: any = {};
          if (title) updateData.title = title;
          if (description !== undefined) updateData.description = description;
          if (content) updateData.content = content;
          if (isPublic !== undefined) updateData.isPublic = isPublic;

          const { data: updatedData, error } = await supabase
            .from('Workflow')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          return updatedData;
        }
      } catch (error) {
        console.error('Error updating workflow:', error);
        throw new Error('Failed to update workflow');
      }
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    try {
      if (ctx.prisma) {
        await ctx.prisma.workflow.delete({
          where: { id: input },
        });
      } else {
        const { error } = await supabase
          .from('Workflow')
          .delete()
          .eq('id', input);
        
        if (error) throw error;
      }
      return { id: input };
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw new Error('Failed to delete workflow');
    }
  }),
});
